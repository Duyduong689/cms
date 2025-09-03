import { useCallback, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import debounce from "lodash/debounce"

interface FiltersProps {
  onSearch: (filters: {
    query: string
    status: string
  }) => void
  defaultValues?: {
    query?: string
    status?: string
  }
}

export function PostFilters({ onSearch, defaultValues = {} }: FiltersProps) {
  const [query, setQuery] = useState(defaultValues.query || "")
  const [status, setStatus] = useState(defaultValues.status || "")

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string, searchStatus: string) => {
      onSearch({
        query: searchQuery,
        status: searchStatus,
      })
    }, 300),
    [onSearch]
  )

  // Handle input change with debounce
  const handleQueryChange = (value: string) => {
    setQuery(value)
    debouncedSearch(value, status)
  }

  // Handle status change
  const handleStatusChange = (value: string) => {
    const newStatus = value === "all" ? "" : value
    setStatus(newStatus)
    debouncedSearch(query, newStatus)
  }

  // Handle reset
  const handleReset = () => {
    setQuery("")
    setStatus("")
    onSearch({ query: "", status: "" })
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <Input
          placeholder="Search title or slug"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="md:col-span-2"
        />
        <Select value={status || "all"} onValueChange={handleStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleReset} className="w-full">
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
