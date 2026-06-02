"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, X, Pill, Package, AlertCircle, Loader2, Plus } from "lucide-react"
import {
  MasterModal,
  MasterModalContent,
  MasterModalHeader,
  MasterModalFooter,
  MasterModalAction,
} from "@/components/ui/master-modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  medicineService,
  medicineCategoryService,
  type Medicine,
} from "@/core/api/medicineService"
import { queryKeys } from "@/shared/query/query-keys"
import { toast } from "sonner"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onMedicineSelect: (medicine: Medicine) => void
  excludeIds?: number[]
}

export function MedicineSearchModal({ open, onOpenChange, onMedicineSelect, excludeIds = [] }: Props) {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.medicineCategories.all,
    queryFn: () => medicineCategoryService.getAll(),
  })

  const { data: medicines = [], isLoading } = useQuery({
    queryKey: queryKeys.medicines.search(search || undefined, selectedCategory),
    queryFn: () =>
      medicineService.getAll({
        search: search || undefined,
        categoryId: selectedCategory,
      }),
  })

  const filtered = medicines.filter((m) => !excludeIds.includes(m.id))

  const handleSelect = (med: Medicine) => {
    if (med.stockQuantity <= 0) {
      toast.error("Thuốc đã hết hàng")
      return
    }
    onMedicineSelect(med)
    onOpenChange(false)
    setSearch("")
    setSelectedCategory(null)
  }

  const handleClose = () => {
    onOpenChange(false)
    setSearch("")
    setSelectedCategory(null)
  }

  return (
    <MasterModal open={open} onOpenChange={onOpenChange}>
      <MasterModalContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <MasterModalHeader
          title={
            <div className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-medical-primary" />
              <span>Tìm kiếm thuốc</span>
            </div>
          }
        />

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên thuốc..."
              className="pl-10 h-11"
              autoFocus
            />
            {search && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Category tabs */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Danh mục thuốc</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className={
                  selectedCategory === null
                    ? "bg-medical-primary text-white hover:bg-medical-dark"
                    : ""
                }
              >
                Tất cả
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={
                    selectedCategory === cat.id
                      ? "bg-medical-primary text-white hover:bg-medical-dark"
                      : ""
                  }
                >
                  {cat.nameVi}
                </Button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Kết quả ({filtered.length} thuốc)
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-medical-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <p className="text-slate-500">Không tìm thấy thuốc nào</p>
                <p className="text-sm text-slate-400 mt-1">
                  Thử thay đổi từ khóa hoặc danh mục
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map((med) => {
                  const outOfStock = med.stockQuantity <= 0
                  const lowStock = med.stockQuantity > 0 && med.stockQuantity <= 10

                  return (
                    <div
                      key={med.id}
                      className={`group relative rounded-xl border-2 p-4 transition-all ${
                        outOfStock
                          ? "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed"
                          : "border-slate-200 bg-white hover:border-medical-primary hover:shadow-md cursor-pointer"
                      }`}
                      onClick={() => !outOfStock && handleSelect(med)}
                    >
                      {/* Category badge */}
                      {med.categoryNameVi && (
                        <span className="absolute top-3 right-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-medical-light text-medical-dark">
                          {med.categoryNameVi}
                        </span>
                      )}

                      {/* Name */}
                      <h4 className="font-semibold text-slate-800 pr-16 mb-2 text-sm leading-tight">
                        {med.name}
                      </h4>

                      {/* Details */}
                      <div className="space-y-0.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Đơn vị:</span>
                          <span className="font-medium text-slate-700">{med.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Đơn giá:</span>
                          <span className="font-medium text-medical-primary">
                            {med.price.toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Tồn kho:</span>
                          <span
                            className={`font-medium ${
                              outOfStock
                                ? "text-red-600"
                                : lowStock
                                  ? "text-amber-600"
                                  : "text-slate-700"
                            }`}
                          >
                            {outOfStock ? "Hết hàng" : `${med.stockQuantity} ${med.unit}`}
                          </span>
                        </div>
                      </div>

                      {/* Low stock warning */}
                      {lowStock && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                          <AlertCircle className="h-3 w-3" />
                          <span>Sắp hết hàng</span>
                        </div>
                      )}

                      {/* Add button */}
                      {!outOfStock && (
                        <Button
                          size="sm"
                          className="w-full mt-3 bg-medical-primary text-white hover:bg-medical-dark h-8 text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelect(med)
                          }}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Thêm vào đơn
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <MasterModalFooter className="justify-end">
          <MasterModalAction variant="secondary" onClick={handleClose}>
            Đóng
          </MasterModalAction>
        </MasterModalFooter>
      </MasterModalContent>
    </MasterModal>
  )
}
