import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import DeleteButton from "@/components/admin/DeleteButton";
import Pagination from "@/components/admin/Pagination";
import QuickEditForm from "@/components/admin/QuickEditForm";
import SearchBar from "@/components/admin/SearchBar";
import { adminFetch } from "@/lib/api";

export const metadata: Metadata = { title: "Cities" };

type CityRow = {
  id: number;
  name: string;
  state: string | null;
  state_id: number;
  country: string | null;
  country_id: number;
  status: boolean;
};

type Props = { searchParams: Promise<{ search?: string; page?: string }> };

const statusOptions = [
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

export default async function CitiesPage({ searchParams }: Props) {
  const { search, page } = await searchParams;

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (page) params.set("page", page);
  const qs = params.size > 0 ? `?${params}` : "";

  const cities = await adminFetch<{
    data: CityRow[];
    meta: { current_page: number; last_page: number; total: number };
  }>(`/masterdata/cities${qs}`);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl text-ink mb-2">Cities</h1>
      <p className="text-sm text-ink-soft mb-8">
        The city catalog is large ({cities.meta.total > 0 ? `${cities.meta.total} matches` : "150k+ rows"}) —
        search by name to browse and edit. New cities are best added from a member&apos;s
        address form via the state picker.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <SearchBar placeholder="Search cities by name…" />
        {search && <p className="text-sm text-ink-soft">{cities.meta.total} matches</p>}
      </div>

      <div className="space-y-3">
        {cities.data.map((city) => (
          <Card key={city.id} className="p-4" hover={false}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink">{city.name}</p>
                <p className="text-xs text-ink-soft">
                  {city.state ?? "—"}, {city.country ?? "—"} ·{" "}
                  <span className={city.status ? "text-green-700" : "text-red-700"}>
                    {city.status ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <QuickEditForm
                  endpoint={`/bff/admin/masterdata/cities/${city.id}`}
                  fields={[
                    { name: "name", label: "Name", value: city.name, required: true },
                    { name: "country_id", label: "Country ID", value: city.country_id, type: "number", required: true },
                    { name: "state_id", label: "State ID", value: city.state_id, type: "number", required: true },
                    { name: "status", label: "Status", value: city.status ? "1" : "0", type: "select", options: statusOptions, required: true },
                  ]}
                />
                <DeleteButton
                  endpoint={`/bff/admin/masterdata/cities/${city.id}`}
                  confirmText="Delete this city?"
                />
              </div>
            </div>
          </Card>
        ))}
        {!search && cities.data.length === 0 && (
          <Card className="p-8 text-center" hover={false}>
            <p className="text-sm text-ink-soft">Search for a city name above to list matching cities.</p>
          </Card>
        )}
      </div>

      <Pagination
        currentPage={cities.meta.current_page}
        lastPage={cities.meta.last_page}
        basePath="/console/cities"
        searchParams={{ search }}
      />
    </div>
  );
}
