"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type {
  PatientGenderFilter,
  PatientInsuranceFilter,
} from "@/modules/patient/types"
import { Search } from "lucide-react"

type PatientFiltersToolbarProps = {
  searchQuery: string
  onSearchChange: (value: string) => void
  genderFilter: PatientGenderFilter
  onGenderChange: (value: PatientGenderFilter) => void
  insuranceFilter: PatientInsuranceFilter
  onInsuranceChange: (value: PatientInsuranceFilter) => void
  onClearFilters: () => void
}

export function PatientFiltersToolbar({
  searchQuery,
  onSearchChange,
  genderFilter,
  onGenderChange,
  insuranceFilter,
  onInsuranceChange,
  onClearFilters,
}: PatientFiltersToolbarProps) {
  return (
    <div className="border-b border-slate-200 px-6 py-4">
      <div className="grid items-end gap-4 lg:grid-cols-[1.5fr_1fr_1fr_120px]">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Tìm kiếm nhanh
          </label>
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm mã hồ sơ, tên, SĐT, mã BHYT"
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Giới tính
          </label>
          <Select
            value={genderFilter}
            onValueChange={(value) => onGenderChange(value as PatientGenderFilter)}
          >
            <SelectTrigger className="w-full" size="sm">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="MALE">Nam</SelectItem>
              <SelectItem value="FEMALE">Nữ</SelectItem>
              <SelectItem value="OTHER">Khác</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            BHYT
          </label>
          <Select
            value={insuranceFilter}
            onValueChange={(value) =>
              onInsuranceChange(value as PatientInsuranceFilter)
            }
          >
            <SelectTrigger className="w-full" size="sm">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="HAS">Có BHYT</SelectItem>
              <SelectItem value="NONE">Không BHYT</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="w-full" onClick={onClearFilters}>
            Xóa lọc
          </Button>
        </div>
      </div>
    </div>
  )
}
