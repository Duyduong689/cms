import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import debounce from "lodash/debounce";
import { USER_ROLES, USER_STATUSES, USER_ROLE_LABELS, USER_STATUS_LABELS } from "@/lib/constants/user";

interface UserFiltersProps {
  onSearch: (filters: {
    query: string;
    role: string;
    status: string;
  }) => void;
  defaultValues?: {
    query?: string;
    role?: string;
    status?: string;
  };
}

export function UserFilters({ onSearch, defaultValues = {} }: UserFiltersProps) {
  const [query, setQuery] = useState(defaultValues.query || "");
  const [role, setRole] = useState(defaultValues.role || "");
  const [status, setStatus] = useState(defaultValues.status || "");

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string, searchRole: string, searchStatus: string) => {
      onSearch({
        query: searchQuery,
        role: searchRole,
        status: searchStatus,
      });
    }, 300),
    [onSearch]
  );

  // Handle input change with debounce
  const handleQueryChange = (value: string) => {
    setQuery(value);
    debouncedSearch(value, role, status);
  };

  // Handle role change
  const handleRoleChange = (value: string) => {
    const newRole = value === "all" ? "" : value;
    setRole(newRole);
    debouncedSearch(query, newRole, status);
  };

  // Handle status change
  const handleStatusChange = (value: string) => {
    const newStatus = value === "all" ? "" : value;
    setStatus(newStatus);
    debouncedSearch(query, role, newStatus);
  };

  // Handle reset
  const handleReset = () => {
    setQuery("");
    setRole("");
    setStatus("");
    onSearch({ query: "", role: "", status: "" });
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-5 gap-3">
        <Input
          placeholder="Search name or email"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="md:col-span-2"
        />
        <Select value={role || "all"} onValueChange={handleRoleChange}>
          <SelectTrigger>
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value={USER_ROLES.ADMIN}>{USER_ROLE_LABELS[USER_ROLES.ADMIN]}</SelectItem>
            <SelectItem value={USER_ROLES.STAFF}>{USER_ROLE_LABELS[USER_ROLES.STAFF]}</SelectItem>
            <SelectItem value={USER_ROLES.CUSTOMER}>{USER_ROLE_LABELS[USER_ROLES.CUSTOMER]}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status || "all"} onValueChange={handleStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value={USER_STATUSES.ACTIVE}>{USER_STATUS_LABELS[USER_STATUSES.ACTIVE]}</SelectItem>
            <SelectItem value={USER_STATUSES.DISABLED}>{USER_STATUS_LABELS[USER_STATUSES.DISABLED]}</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleReset} className="w-full">
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
