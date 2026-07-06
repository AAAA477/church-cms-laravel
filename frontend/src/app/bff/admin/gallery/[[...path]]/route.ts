import { createAdminProxy } from "@/lib/admin-proxy";

export const { GET, POST, PUT, PATCH, DELETE } = createAdminProxy("gallery");
