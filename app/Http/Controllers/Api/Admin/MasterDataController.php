<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\Country;
use App\Models\State;
use Illuminate\Http\Request;

/**
 * Location master data (Country/State/City) for the Next.js admin console.
 *
 * Two surfaces:
 *  - lightweight lookups (countries/states/cities) feeding the cascading
 *    address pickers on Member/Guest/Sub-admin forms;
 *  - managed CRUD (manageCountries/manageStates/manageCities + store/
 *    update/destroy), mirroring app/Http/Controllers/Admin/MasterData/
 *    {Country,State,City}Controller for the /console/countries|states|
 *    cities pages. Note these are global tables with no church_id — the
 *    legacy panel exposed them to church admins (usergroup 3) as-is, and
 *    console routes sit behind the same churchadmin middleware.
 */
class MasterDataController extends Controller
{
    // ── Lookups (cascading pickers) ─────────────────────────────────────

    public function countries()
    {
        return response()->json(Country::orderBy('name')->get(['id', 'name']));
    }

    public function states(Request $request)
    {
        // `states` has ~5,300 rows — cheap enough to list globally for a
        // country-less dropdown, but always prefer scoping by country_id
        // when the caller has one (a cascading picker always does).
        $request->validate(['country_id' => 'nullable|integer']);

        $query = State::orderBy('name');

        if ($countryId = $request->query('country_id')) {
            $query->where('country_id', $countryId);
        }

        return response()->json($query->get(['id', 'name', 'country_id']));
    }

    public function cities(Request $request)
    {
        // `cities` has ~154,000 rows — an unscoped query here previously
        // exhausted memory and crashed with an empty 500. A real cascading
        // picker always has a selected state before asking for its cities,
        // so state_id is required, not just preferred.
        $request->validate(['state_id' => 'required|integer']);

        $cities = City::where('state_id', $request->query('state_id'))
            ->orderBy('name')
            ->get(['id', 'name', 'state_id']);

        return response()->json($cities);
    }

    // ── Managed CRUD: Countries ─────────────────────────────────────────

    public function manageCountries(Request $request)
    {
        $query = Country::orderBy('name');

        if ($search = $request->query('search')) {
            $query->where('name', 'LIKE', "%{$search}%");
        }
        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $countries = $query->paginate(20)->withQueryString();

        return response()->json([
            'data' => collect($countries->items())->map(fn (Country $c) => [
                'id'         => $c->id,
                'name'       => $c->name,
                'short_name' => $c->short_name,
                'iso_code'   => $c->iso_code,
                'tel_prefix' => $c->tel_prefix,
                'status'     => (bool) $c->status,
            ]),
            'meta' => $this->meta($countries),
        ]);
    }

    public function storeCountry(Request $request)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:100',
            'short_name' => 'nullable|string|max:50',
            'iso_code'   => 'nullable|string|max:10',
            'tel_prefix' => 'nullable|string|max:10',
            'status'     => 'required|boolean',
        ]);

        $country = Country::create($data);

        return response()->json(['success' => true, 'id' => $country->id], 201);
    }

    public function updateCountry(Request $request, $id)
    {
        $country = Country::find($id);
        if (! $country) {
            return response()->json(['message' => 'Country not found'], 404);
        }

        $data = $request->validate([
            'name'       => 'required|string|max:100',
            'short_name' => 'nullable|string|max:50',
            'iso_code'   => 'nullable|string|max:10',
            'tel_prefix' => 'nullable|string|max:10',
            'status'     => 'required|boolean',
        ]);

        $country->update($data);

        return response()->json(['success' => true]);
    }

    public function destroyCountry($id)
    {
        $country = Country::find($id);
        if (! $country) {
            return response()->json(['message' => 'Country not found'], 404);
        }

        $country->delete();

        return response()->json(['success' => true]);
    }

    // ── Managed CRUD: States ────────────────────────────────────────────

    public function manageStates(Request $request)
    {
        $query = State::with('country')->orderBy('name');

        if ($search = $request->query('search')) {
            $query->where('name', 'LIKE', "%{$search}%");
        }
        if ($countryId = $request->query('country_id')) {
            $query->where('country_id', $countryId);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $states = $query->paginate(20)->withQueryString();

        return response()->json([
            'data' => collect($states->items())->map(fn (State $s) => [
                'id'         => $s->id,
                'name'       => $s->name,
                'country'    => optional($s->country)->name,
                'country_id' => $s->country_id,
                'status'     => (bool) $s->status,
            ]),
            'meta' => $this->meta($states),
        ]);
    }

    public function storeState(Request $request)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:100',
            'country_id' => 'required|integer|exists:countries,id',
            'status'     => 'required|boolean',
        ]);

        $state = State::create($data);

        return response()->json(['success' => true, 'id' => $state->id], 201);
    }

    public function updateState(Request $request, $id)
    {
        $state = State::find($id);
        if (! $state) {
            return response()->json(['message' => 'State not found'], 404);
        }

        $data = $request->validate([
            'name'       => 'required|string|max:100',
            'country_id' => 'required|integer|exists:countries,id',
            'status'     => 'required|boolean',
        ]);

        $state->update($data);

        return response()->json(['success' => true]);
    }

    public function destroyState($id)
    {
        $state = State::find($id);
        if (! $state) {
            return response()->json(['message' => 'State not found'], 404);
        }

        $state->delete();

        return response()->json(['success' => true]);
    }

    // ── Managed CRUD: Cities ────────────────────────────────────────────

    public function manageCities(Request $request)
    {
        $query = City::with(['state', 'country'])->orderBy('name');

        // Same guard rationale as cities(): without a filter this table is
        // 154k rows, so require either a search term or a state filter
        // before listing; the console page always sends one.
        if (! $request->query('search') && ! $request->query('state_id')) {
            return response()->json([
                'data' => [],
                'meta' => ['current_page' => 1, 'last_page' => 1, 'total' => 0],
                'hint' => 'Provide search or state_id to list cities.',
            ]);
        }

        if ($search = $request->query('search')) {
            $query->where('name', 'LIKE', "%{$search}%");
        }
        if ($stateId = $request->query('state_id')) {
            $query->where('state_id', $stateId);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $cities = $query->paginate(20)->withQueryString();

        return response()->json([
            'data' => collect($cities->items())->map(fn (City $c) => [
                'id'         => $c->id,
                'name'       => $c->name,
                'state'      => optional($c->state)->name,
                'state_id'   => $c->state_id,
                'country'    => optional($c->country)->name,
                'country_id' => $c->country_id,
                'status'     => (bool) $c->status,
            ]),
            'meta' => $this->meta($cities),
        ]);
    }

    public function storeCity(Request $request)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:100',
            'country_id' => 'required|integer|exists:countries,id',
            'state_id'   => 'required|integer|exists:states,id',
            'status'     => 'required|boolean',
        ]);

        $city = City::create($data);

        return response()->json(['success' => true, 'id' => $city->id], 201);
    }

    public function updateCity(Request $request, $id)
    {
        $city = City::find($id);
        if (! $city) {
            return response()->json(['message' => 'City not found'], 404);
        }

        $data = $request->validate([
            'name'       => 'required|string|max:100',
            'country_id' => 'required|integer|exists:countries,id',
            'state_id'   => 'required|integer|exists:states,id',
            'status'     => 'required|boolean',
        ]);

        $city->update($data);

        return response()->json(['success' => true]);
    }

    public function destroyCity($id)
    {
        $city = City::find($id);
        if (! $city) {
            return response()->json(['message' => 'City not found'], 404);
        }

        $city->delete();

        return response()->json(['success' => true]);
    }

    private function meta($paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'last_page'    => $paginator->lastPage(),
            'total'        => $paginator->total(),
        ];
    }
}
