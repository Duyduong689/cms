"use client";

import React, { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Package } from "lucide-react";

export type ColumnDef<T> = {
  header: string;
  accessorKey?: keyof T;
  cell: (item: T) => ReactNode;
  className?: string;
};

export type DataTableProps<T> = {
  columns: ColumnDef<T>[];
  data: T[] | undefined;
  isLoading: boolean;
  loadingRowCount?: number;
  emptyStateMessage?: string;
  emptyStateDescription?: string;
  emptyStateIcon?: ReactNode;
  keyField?: keyof T;
};

export function DataTable<T>({
  columns,
  data,
  isLoading,
  loadingRowCount = 5,
  emptyStateMessage = "No data found",
  emptyStateDescription = "Try adjusting your search or filter criteria",
  emptyStateIcon = <Package className="h-12 w-12 text-muted-foreground" />,
  keyField = "id" as keyof T,
}: DataTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => (
            <TableHead key={index} className={column.className}>
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: loadingRowCount }).map((_, rowIndex) => (
            <TableRow key={`loading-${rowIndex}`}>
              {columns.map((column, colIndex) => (
                <TableCell key={`loading-cell-${rowIndex}-${colIndex}`}>
                  {colIndex === 0 ? (
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ) : (
                    <Skeleton className={`h-${colIndex === columns.length - 1 ? "8" : "4"} w-${colIndex === columns.length - 1 ? "8 ml-auto" : "16"}`} />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : !data || data.length === 0 ? (
          // Empty state
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center py-8">
              <div className="flex flex-col items-center gap-2">
                {emptyStateIcon}
                <p className="text-muted-foreground">{emptyStateMessage}</p>
                <p className="text-sm text-muted-foreground">
                  {emptyStateDescription}
                </p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          // Data rows
          data.map((item, index) => (
            <TableRow key={String(item[keyField] || index)}>
              {columns.map((column, colIndex) => (
                <TableCell key={`${String(item[keyField] || index)}-${colIndex}`} className={column.className}>
                  {column.cell(item)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
