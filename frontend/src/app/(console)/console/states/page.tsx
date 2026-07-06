import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import DeleteButton from "@/components/admin/DeleteButton";
import Pagination from "@/components/admin/Pagination";
import QuickCreateForm from "@/components/admin/QuickCreateForm";
import QuickEditForm from "@/components/admin/QuickEditForm";
import SearchBar from "@/components/admin/SearchBar";
import { adminFetch } from "@/lib/api";

export const metadata: Metadata = { title: "States" };

type StateRow = {
  id: number;
  name: string;
  country: string | null;
  country_id: number;
  status: boolean;
};

type Props = { searchParams: Promise<{ search?: string; page?: string }> };

const statusOptions = [
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

export default async function StatesPage({ searchParams }: Props) {
  const { search, page } = await searchParams;

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (page) params.set("page", page);
  const qs = params.size > 0 ? `?${params}` : "";

  const [states, countries] = await Promise.all([
    adminFetch<{
      data: StateRow[];
      meta: { current_page: number; last_page: number; total: number };
    }>(`/masterdata/states${qs}`),
    adminFetch<{ id: number; name: string }[]>("/countries"),
  ]);

  const countryOptions = countries.map((c) => ({ value: String(c.id), label: c.name }));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl text-ink mb-8">States</h1>

      <Card className="p-8 mb-6" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Add State</h2>
        <QuickCreateForm
          endpoint="/bff/admin/masterdata/states"
          fields={[
            { name: "name", label: "Name", value: null, required: true },
            { name: "country_id", label: "Country", value: null, type: "select", options: countryOptions, required: true },
            { name: "status", label: "Status", value: "1", type: "select", options: statusOptions, required: true },
          ]}
        />
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <SearchBar placeholder="Search states…" />
        <p className="text-sm text-ink-soft">{states.meta.total} total</p>
      </div>

      <div className="space-y-3">
        {states.data.map((state) => (
          <Card key={state.id} className="p-4" hover={false}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink">{state.name}</p>
                <p className="text-xs text-ink-soft">
                  {state.country ?? "—"} ·{" "}
                  <span className={state.status ? "text-green-700" : "text-red-700"}>
                    {state.status ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <QuickEditForm
                  endpoint={`/bff/admin/masterdata/states/${state.id}`}
                  fields={[
                    { name: "name", label: "Name", value: state.name, required: true },
                    { name: "country_id", label: "Country", value: String(state.country_id), type: "select", options: countryOptions, required: true },
                    { name: "status", label: "Status", value: state.status ? "1" : "0", type: "select", options: statusOptions, required: true },
                  ]}
                />
                <DeleteButton
                  endpoint={`/bff/admin/masterdata/states/${state.id}`}
                  confirmText="Delete this state?"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Pagination
        currentPage={states.meta.current_page}
        lastPage={states.meta.last_page}
        basePath="/console/states"
        searchParams={{ search }}
      />
    </div>
  );
}
