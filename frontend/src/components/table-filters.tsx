"use client"

import * as React from "react"
import { Search, SlidersHorizontal, X, FileDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface FilterOption {
    label: string
    value: string
}

interface TableFiltersProps {
    onSearch: (value: string) => void
    onCategoryChange: (value: string) => void
    onStatusChange: (value: string) => void
    categories: FilterOption[]
    statuses: FilterOption[]
    activeCategory?: string
    activeStatus?: string
    searchTerm?: string
    onExport?: () => void
}

export function TableFilters({
    onSearch,
    onCategoryChange,
    onStatusChange,
    categories,
    statuses,
    activeCategory,
    activeStatus,
    searchTerm,
    onExport,
}: TableFiltersProps) {
    const [isExpanded, setIsExpanded] = React.useState(false)

    const hasActiveFilters = (activeCategory && activeCategory !== "all") ||
        (activeStatus && activeStatus !== "all") ||
        searchTerm

    const clearFilters = () => {
        onSearch("")
        onCategoryChange("all")
        onStatusChange("all")
    }

    return (
        <div className="space-y-3 w-full">
            <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Ara..."
                        className="pl-9 h-10 transition-all focus:ring-2 focus:ring-primary/20"
                        value={searchTerm}
                        onChange={(e) => onSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        className={`h-10 px-3 flex-1 sm:flex-none ${isExpanded ? "bg-accent" : ""}`}
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Filtreler
                        {hasActiveFilters && (
                            <Badge variant="secondary" className="ml-2 px-1 py-0 h-4 min-w-4 flex items-center justify-center bg-primary text-primary-foreground text-[10px]">
                                !
                            </Badge>
                        )}
                    </Button>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 text-muted-foreground hover:text-foreground"
                            onClick={clearFilters}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Temizle
                        </Button>
                    )}
                    {onExport && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-10 px-3 bg-muted/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                            onClick={onExport}
                        >
                            <FileDown className="h-4 w-4" />
                            <span className="ml-2 hidden lg:inline">Dışa Aktar</span>
                        </Button>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/30 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kategori</label>
                        <Select value={activeCategory || "all"} onValueChange={onCategoryChange}>
                            <SelectTrigger className="h-9 bg-background">
                                <SelectValue placeholder="Tüm Kategoriler" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Durum</label>
                        <Select value={activeStatus || "all"} onValueChange={onStatusChange}>
                            <SelectTrigger className="h-9 bg-background">
                                <SelectValue placeholder="Tüm Durumlar" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tüm Durumlar</SelectItem>
                                {statuses.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}
        </div>
    )
}
