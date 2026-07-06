import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import DeleteButton from "@/components/admin/DeleteButton";
import Pagination from "@/components/admin/Pagination";
import QuickCreateForm from "@/components/admin/QuickCreateForm";
import QuickEditForm from "@/components/admin/QuickEditForm";
import SearchBar from "@/components/admin/SearchBar";
import { adminFetch } from "@/lib/api";

export const metadata: Metadata = { title: "Countries" };

type Country = {
  id: number;
  name: string;
  short_name: string | null;
  iso_code: string | null;
  tel_prefix: string | null;
  status: boolean;
};

type Props = { searchParams: Promise<{ search?: string; page?: string }> };

const statusOptions = [
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

export default async function CountriesPage({ searchParams }: Props) {
  const { search, page } = await searchParams;

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (page) params.set("page", page);
  const qs = params.size > 0 ? `?${params}` : "";

  const countries = await adminFetch<{
    data: Country[];
    meta: { current_page: number; last_page: number; total: number };
  }>(`/masterdata/countries${qs}`);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-4xl text-ink mb-8">Countries</h1>

      <Card className="p-8 mb-6" hover={false}>
        <h2 className="font-display text-2xl text-ink mb-6">Add Country</h2>
        <QuickCreateForm
          endpoint="/bff/admin/masterdata/countries"
          fields={[
            { name: "name", label: "Name", value: null, required: true },
            { name: "short_name", label: "Short Name", value: null },
            { name: "iso_code", label: "ISO Code", value: null },
            { name: "tel_prefix", label: "Tel Prefix", value: null },
            { name: "status", label: "Status", value: "1", type: "select", options: statusOptions, required: true },
          ]}
        />
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <SearchBar placeholder="Search countries…" />
        <p className="text-sm text-ink-soft">{countries.meta.total} total</p>
      </div>

      <div className="space-y-3">
        {countries.data.map((country) => (
          <Card key={country.id} className="p-4" hover={false}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink">{country.name}</p>
                <p className="text-xs text-ink-soft">
                  {country.iso_code ?? "—"} · {country.tel_prefix ?? "—"} ·{" "}
                  <span className={country.status ? "text-green-700" : "text-red-700"}>
                    {country.status ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <QuickEditForm
                  endpoint={`/bff/admin/masterdata/countries/${country.id}`}
                  fields={[
                    { name: "name", label: "Name", value: country.name, required: true },
                    { name: "short_name", label: "Short Name", value: country.short_name },
                    { name: "iso_code", label: "ISO Code", value: country.iso_code },
                    { name: "tel_prefix", label: "Tel Prefix", value: country.tel_prefix },
                    { name: "status", label: "Status", value: country.status ? "1" : "0", type: "select", options: statusOptions, required: true },
                  ]}
                />
                <DeleteButton
                  endpoint={`/bff/admin/masterdata/countries/${country.id}`}
                  confirmText="Delete this country?"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Pagination
        currentPage={countries.meta.current_page}
        lastPage={countries.meta.last_page}
        basePath="/console/countries"
        searchParams={{ search }}
      />
    </div>
  );
}
