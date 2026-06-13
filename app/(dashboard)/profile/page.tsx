"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Stethoscope, 
  Building2,
  Lock,
  Save
} from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()
  
  // Basic states for mock form
  const [formData, setFormData] = useState({
  username: "",
  fullName: "",
  email: "",
  phone: "",
  address: "",
  dob: "",
  gender: "",
  specialty: "",
  roomNumber: "",
  department: ""
})
  const [isSaving, setIsSaving] = useState(false)

  // Load initial data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || "",
        fullName: user.fullName || "",
        email: user.email || "",
        
      }))
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success("Đã cập nhật hồ sơ cá nhân thành công")
    }, 600)
  }

  if (!user) return null

  const isDoctor = user.role === "DOCTOR"
  const isReceptionist = user.role === "RECEPTIONIST"
  const isAdmin = user.role === "ADMIN"

  return (
    <div className="min-h-screen space-y-8 bg-[#fafafa] p-6 lg:p-8">
      <PageHeader
        title="Hồ sơ cá nhân"
        description="Quản lý và cập nhật thông tin cá nhân của bạn trên hệ thống"
      />

      <div className="mx-auto max-w-4xl space-y-6">
        {/* Card: Thông tin cơ bản */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-medical-light text-medical-primary">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Thông tin Cơ bản</h2>
              <p className="text-sm text-slate-500">Các thông tin định danh chính</p>
            </div>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Tên đăng nhập</Label>
              <div className="relative">
                <Input 
                  disabled 
                  value={formData.username} 
                  className="bg-slate-50 pl-10 text-slate-500" 
                />
                <ShieldCheck className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-400">Không thể thay đổi tên đăng nhập</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-700">Họ và tên</Label>
              <div className="relative">
                <Input 
                  value={formData.fullName} 
                  onChange={(e) => handleInputChange("fullName", e.target.value)} 
                  className="pl-10 focus-visible:ring-medical-primary" 
                />
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>
        </section>

        {/* Card: Thông tin Liên hệ & Chi tiết */}
        {( isReceptionist || isDoctor) && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-medical-light text-medical-primary">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Liên hệ & Chi tiết</h2>
              <p className="text-sm text-slate-500">Thông tin liên lạc và chi tiết cá nhân</p>
            </div>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-700">Email</Label>
              <div className="relative">
                <Input 
                  type="email"
                  value={formData.email} 
                  onChange={(e) => handleInputChange("email", e.target.value)} 
                  className="pl-10 focus-visible:ring-medical-primary" 
                />
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-700">Số điện thoại</Label>
              <div className="relative">
                <Input 
                  value={formData.phone} 
                  onChange={(e) => handleInputChange("phone", e.target.value)} 
                  className="pl-10 focus-visible:ring-medical-primary" 
                  placeholder="09xxxxxxx"
                />
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Admin and Receptionist often have basic demographics */}
            {(isAdmin || isReceptionist || isDoctor) && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-700">Ngày sinh</Label>
                  <div className="relative">
                    <Input 
                      type="date"
                      value={formData.dob} 
                      onChange={(e) => handleInputChange("dob", e.target.value)} 
                      className="pl-10 focus-visible:ring-medical-primary" 
                    />
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-700">Giới tính</Label>
                  <Select value={formData.gender} onValueChange={(v) => handleInputChange("gender", v)}>
                    <SelectTrigger className="focus:ring-medical-primary">
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Nam</SelectItem>
                      <SelectItem value="FEMALE">Nữ</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-700">Địa chỉ</Label>
                  <div className="relative">
                    <Input 
                      value={formData.address} 
                      onChange={(e) => handleInputChange("address", e.target.value)} 
                      className="pl-10 focus-visible:ring-medical-primary" 
                      placeholder="Số nhà, tên đường, quận/huyện, tỉnh/thành..."
                    />
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </>
            )}
          </div>
        </section>)}

        {/* Card: Thông tin Chuyên môn (Only for Doctors) */}
        {isDoctor && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-medical-light text-medical-primary">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-800">Thông tin Chuyên môn</h2>
                <p className="text-sm text-slate-500">Chi tiết công tác của bác sĩ</p>
              </div>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-700">Chuyên khoa</Label>
                <div className="relative">
                  <Input 
                    value={formData.specialty} 
                    onChange={(e) => handleInputChange("specialty", e.target.value)} 
                    className="pl-10 focus-visible:ring-medical-primary" 
                    placeholder="Vd: Tim mạch"
                  />
                  <Stethoscope className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-700">Phòng khám</Label>
                <div className="relative">
                  <Input 
                    value={formData.roomNumber} 
                    onChange={(e) => handleInputChange("roomNumber", e.target.value)} 
                    className="pl-10 focus-visible:ring-medical-primary" 
                    placeholder="Vd: P.101"
                  />
                  <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Card: Thông tin Phòng ban (Only for ) */}
        {isReceptionist && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-medical-light text-medical-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-800">Thông tin Phòng ban</h2>
                <p className="text-sm text-slate-500">Chi tiết công tác của lễ tân</p>
              </div>
            </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-700">Phòng ban</Label>
                <div className="relative">
                  <Input 
                    value={formData.department} 
                    onChange={(e) => handleInputChange("department", e.target.value)} 
                    className="pl-10 focus-visible:ring-medical-primary" 
                    placeholder="Vd: P.101"
                  />
                  <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                </div>
              </div>
          </section>
        )}
          

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Button variant="ghost" className="rounded-full px-6 font-semibold text-slate-500 hover:bg-slate-200">
            Hủy thay đổi
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="rounded-full bg-medical-primary px-8 shadow-lg shadow-medical-primary/25 transition-all hover:bg-medical-dark active:scale-95"
          >
            {isSaving ? "Đang lưu..." : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Lưu hồ sơ
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
