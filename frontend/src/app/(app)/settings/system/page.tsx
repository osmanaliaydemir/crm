"use client"

import {
    Users,
    ShieldAlert,
    Bell,
    Lock,
    Plus,
    MoreHorizontal,
    Search,
    Key,
    Smartphone,
    Palette,
    Check,
    Trash2,
    Shield,
    Edit2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { PageWrapper } from "@/components/page-wrapper"
import { useThemeStore, ThemePrimaryColor } from "@/store/themeStore"
import { useTheme } from "next-themes"
import { Skeleton } from "@/components/ui/skeleton"
import { useUsers, useSystemSettings, SystemUser, SystemSetting } from "@/hooks/api/use-system-settings"
import { api } from "@/lib/api"

const userSchema = z.object({
    name: z.string().min(2, "Ad Soyad en az 2 karakter olmalıdır"),
    email: z.string().email("Geçerli bir e-posta giriniz"),
    role: z.string().min(2, "Rol seçimi zorunludur"),
    department: z.string().min(2, "Departman seçimi zorunludur"),
    status: z.enum(["Aktif", "Pasif"], { message: "Durum seçimi zorunludur" })
})

type UserFormValues = z.infer<typeof userSchema>

type SystemModule = "Dashboard" | "CRM" | "Finance" | "Pipeline" | "Inventory" | "Calendar" | "HR" | "Reports" | "Settings"

const AVAILABLE_MODULES: { id: SystemModule, label: string }[] = [
    { id: "Dashboard", label: "Gösterge Paneli" },
    { id: "CRM", label: "Müşteri Yönetimi (CRM)" },
    { id: "Finance", label: "Finans & Ön Muhasebe" },
    { id: "Pipeline", label: "Satış Fırsatları" },
    { id: "Inventory", label: "Ürün & Envanter" },
    { id: "Calendar", label: "Ajanda & Takvim" },
    { id: "HR", label: "İnsan Kaynakları" },
    { id: "Reports", label: "Raporlar" },
    { id: "Settings", label: "Sistem Ayarları" },
]

type RoleType = {
    id: number;
    name: string;
    description: string;
    isDefault?: boolean;
    permissions: SystemModule[];
}

const initialRoles: RoleType[] = [
    {
        id: 1,
        name: "Super Admin",
        description: "Sistemdeki tüm modül ve ayarlara tam erişim yetkisi.",
        isDefault: true,
        permissions: ["Dashboard", "CRM", "Finance", "Pipeline", "Inventory", "Calendar", "HR", "Reports", "Settings"]
    },
    {
        id: 2,
        name: "Satış Yöneticisi",
        description: "Tüm CRM, Pipeline ve Siparişleri görüp düzenleyebilir.",
        permissions: ["Dashboard", "CRM", "Pipeline", "Calendar", "Reports"]
    },
    {
        id: 3,
        name: "İnsan Kaynakları",
        description: "Personel ve İzinler sistemine erişebilir.",
        permissions: ["Dashboard", "Calendar", "HR"]
    }
]

const roleSchema = z.object({
    name: z.string().min(2, "Rol adı zorunludur"),
    description: z.string().min(5, "Açıklama zorunludur"),
    permissions: z.array(z.string()).min(1, "En az bir yetki seçmelisiniz")
})
type RoleFormValues = z.infer<typeof roleSchema>

export default function SystemSettingsPage() {
    const { primaryColor, setPrimaryColor } = useThemeStore()
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    const { users, isLoading: usersLoading, updateStatus, deleteUser } = useUsers()
    const { settings, isLoading: settingsLoading, saveSettings } = useSystemSettings()

    // Ensure component is mounted before dependent rendering
    useEffect(() => { setMounted(true) }, [])

    const [searchTerm, setSearchTerm] = useState("")

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<string | null>(null)

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema) as any,
        defaultValues: {
            name: "",
            email: "",
            role: "Satış Yöneticisi",
            department: "Satış",
            status: "Aktif"
        }
    })

    const [roles, setRoles] = useState<RoleType[]>(initialRoles)
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
    const [editingRole, setEditingRole] = useState<RoleType | null>(null)
    const [roleToDelete, setRoleToDelete] = useState<number | null>(null)
    const [isDeleteRoleDialogOpen, setIsDeleteRoleDialogOpen] = useState(false)

    const roleForm = useForm<RoleFormValues>({
        resolver: zodResolver(roleSchema) as any,
        defaultValues: {
            name: "",
            description: "",
            permissions: []
        }
    })

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const onSubmit = async (data: UserFormValues) => {
        try {
            await api.post("/api/Auth/register", {
                firstName: data.name.split(" ")[0],
                lastName: data.name.split(" ").slice(1).join(" "),
                email: data.email,
                password: "User123!", // Geçici şifre
                department: data.department
            });
            toast.success("Yeni personel sisteme başarıyla davet edildi.");
            setIsDialogOpen(false);
            form.reset();
        } catch (error) {
            toast.error("Personel davet edilemedi.");
        }
    }

    const handleDeleteUser = async () => {
        if (userToDelete) {
            await deleteUser(userToDelete)
            setIsDeleteDialogOpen(false)
            setUserToDelete(null)
        }
    }

    const toggleUserStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === "Aktif" ? "Pasif" : "Aktif"
        await updateStatus({ id, status: newStatus })
    }

    const onRoleSubmit = (data: RoleFormValues) => {
        if (editingRole) {
            setRoles(roles.map(r => r.id === editingRole.id ? { ...r, ...data, permissions: data.permissions as SystemModule[] } : r))
            toast.success("Rol izinleri başarıyla güncellendi.")
        } else {
            const newRole: RoleType = {
                id: roles.length > 0 ? Math.max(...roles.map(r => r.id)) + 1 : 1,
                name: data.name,
                description: data.description,
                permissions: data.permissions as SystemModule[]
            }
            setRoles([...roles, newRole])
            toast.success("Yeni Sistem Rolü eklendi.")
        }
        setIsRoleDialogOpen(false)
        roleForm.reset()
    }

    const deleteRole = () => {
        if (roleToDelete !== null) {
            setRoles(roles.filter(r => r.id !== roleToDelete))
            toast.success("Rol başarıyla silindi.")
            setIsDeleteRoleDialogOpen(false)
            setRoleToDelete(null)
        }
    }

    const getSettingValue = (key: string) => settings.find(s => s.key === key)?.value || ""

    const toggleSetting = async (key: string, category: string, description: string) => {
        const currentValue = getSettingValue(key)
        const newValue = currentValue === "true" ? "false" : "true"
        await saveSettings([{ key, value: newValue, category, description }])
    }

    return (
        <PageWrapper className="flex flex-col gap-6 max-w-6xl mx-auto w-full pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Sistem Ayarları</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Kullanıcıları, yetki rollerini (RBAC), güvenlik kurallarını ve bildirim tercihlerini yönetin.
                </p>
            </div>

            <Tabs defaultValue="users" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="users" className="flex items-center gap-2">
                        <Users className="h-4 w-4" /> Kullanıcılar
                    </TabsTrigger>
                    <TabsTrigger value="roles" className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4" /> Roller & Yetkiler (RBAC)
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" /> Güvenlik
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="flex items-center gap-2">
                        <Palette className="h-4 w-4" /> Görünüm & Tema
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" /> Bildirimler
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-4">
                    <Card className="shadow-sm">
                        <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-center gap-4 bg-background px-6 rounded-t-xl">
                            <div className="relative w-full sm:max-w-xs transition-all focus-within:ring-2 focus-within:ring-primary/20 rounded-md">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Kullanıcı ismi veya e-posta..."
                                    className="pl-9 bg-muted/40 border-muted-foreground/20 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none transition-colors hover:bg-muted/60"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="group transition-all hover:shadow-md hover:ring-2 hover:ring-primary/20 hover:ring-offset-2">
                                        <Plus className="mr-2 h-4 w-4 transition-transform group-hover:scale-125" /> Yeni Davet
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Yeni Personel Daveti</DialogTitle>
                                        <DialogDescription>
                                            Sisteme eklenecek yeni kullanıcının temel bilgilerini ve yetki rolünü belirleyin.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Ad Soyad</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Örn: Merve Demir" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Kurumsal E-posta</FormLabel>
                                                        <FormControl>
                                                            <Input type="email" placeholder="merve@sirketadi.com" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="department"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Departman</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Seçiniz..." />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="Yönetim">Yönetim</SelectItem>
                                                                    <SelectItem value="Satış">Satış</SelectItem>
                                                                    <SelectItem value="Pazarlama">Pazarlama</SelectItem>
                                                                    <SelectItem value="Finans">Finans</SelectItem>
                                                                    <SelectItem value="Müşteri Destek">Müşteri Destek</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="role"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Yetki Rolü</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Rol Seçin" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {roles.map(r => (
                                                                        <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="pt-4 border-t flex justify-end gap-2">
                                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>İptal</Button>
                                                <Button type="submit">Davetiye Gönder ve Ekle</Button>
                                            </div>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead className="w-[250px] pl-6">Kullanıcı Bilgileri</TableHead>
                                        <TableHead>Departman</TableHead>
                                        <TableHead>Rol (Yetki Seviyesi)</TableHead>
                                        <TableHead>Durum</TableHead>
                                        <TableHead className="text-right pr-6">İşlem</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {usersLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="pl-6"><Skeleton className="h-10 w-40" /></TableCell>
                                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                                <TableCell className="text-right pr-6"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => {
                                            const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
                                            return (
                                                <TableRow key={user.id} className="group hover:bg-muted/30 transition-colors">
                                                    <TableCell className="pl-6">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-9 w-9 border hidden sm:flex group-hover:border-primary/50 transition-colors">
                                                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-all">{initials}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-sm group-hover:text-primary transition-colors">{user.name}</span>
                                                                <span className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors">{user.email}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm font-medium text-muted-foreground">
                                                        {user.department || "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={user.role === "Super Admin" || user.role === "admin" ? "default" : "secondary"} className="font-normal shadow-none">
                                                            {user.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.status === "Aktif" ? (
                                                            <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                                                                <span className="h-2 w-2 rounded-full bg-green-600"></span>
                                                                Aktif
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                                                <span className="h-2 w-2 rounded-full bg-muted-foreground"></span>
                                                                Pasif
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                                                                <DropdownMenuItem>Bilgileri Düzenle</DropdownMenuItem>
                                                                <DropdownMenuItem>Rol Değiştir</DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="cursor-pointer"
                                                                    onClick={() => toggleUserStatus(user.id, user.status)}
                                                                >
                                                                    {user.status === "Aktif" ? "Kullanıcıyı Pasife Al" : "Kullanıcıyı Aktifleştir"}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-destructive focus:bg-destructive/10 cursor-pointer"
                                                                    onClick={() => {
                                                                        setUserToDelete(user.id)
                                                                        setIsDeleteDialogOpen(true)
                                                                    }}
                                                                >
                                                                    Sistemden Sil
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center justify-center space-y-3 animate-in fade-in duration-500">
                                                    <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center ring-4 ring-background">
                                                        <Users className="h-6 w-6 text-muted-foreground/60" />
                                                    </div>
                                                    <p className="font-medium">Kullanıcı Bulunamadı</p>
                                                    <p className="text-xs text-muted-foreground/80 max-w-sm mx-auto">
                                                        Arama kriterinize uygun herhangi bir personel bulunmamaktadır.
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="roles" className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/30 p-5 rounded-2xl border border-muted/50 shadow-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent pointer-events-none" />
                        <div className="relative z-10">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" /> Sistem Rolleri ve Erişim İzinleri
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                                Güvenlik standartları gereği kullanıcıları yetkilendirirken "En Az Ayrıcalık" (Least Privilege) prensibini uygulayın. Modül bazlı erişimleri buradan detaylıca kısıtlayabilirsiniz.
                            </p>
                        </div>
                        <Button
                            onClick={() => {
                                roleForm.reset({ name: "", description: "", permissions: [] })
                                setEditingRole(null)
                                setIsRoleDialogOpen(true)
                            }}
                            className="w-full md:w-auto shadow-md hover:shadow-lg transition-all group relative z-10"
                        >
                            <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" /> Yeni Rol Oluştur
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {roles.map(role => (
                            <Card key={role.id} className="group relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border-muted/60 hover:border-primary/30 bg-card hover:-translate-y-1">
                                {/* Decorative background gradient hover */}
                                <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                <CardHeader className="pb-4 relative z-10 flex flex-row items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-500 ${role.isDefault ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground ring-1 ring-border shadow-sm group-hover:bg-primary/10 group-hover:text-primary group-hover:ring-primary/20'}`}>
                                            {role.isDefault ? <ShieldAlert className="h-6 w-6" /> : <Key className="h-6 w-6 transition-transform duration-500 group-hover:scale-110" />}
                                        </div>
                                        <div className="mt-0.5">
                                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                                {role.name}
                                                {role.isDefault && <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-primary/10 text-primary border-primary/20">Sistem</Badge>}
                                            </CardTitle>
                                            <CardDescription className="line-clamp-2 mt-1 min-h-[40px] text-xs leading-relaxed">{role.description}</CardDescription>
                                        </div>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2 text-muted-foreground hover:text-foreground opacity-50 group-hover:opacity-100 transition-opacity">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuLabel className="text-xs text-muted-foreground">İşlemler</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="cursor-pointer" onClick={() => {
                                                roleForm.reset({ name: role.name, description: role.description, permissions: role.permissions })
                                                setEditingRole(role)
                                                setIsRoleDialogOpen(true)
                                            }}>
                                                <Edit2 className="h-4 w-4 mr-2" /> {role.isDefault ? 'Yetkileri İncele' : 'Rolü Düzenle'}
                                            </DropdownMenuItem>
                                            {!role.isDefault && (
                                                <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer" onClick={() => {
                                                    setRoleToDelete(role.id)
                                                    setIsDeleteRoleDialogOpen(true)
                                                }}>
                                                    <Trash2 className="h-4 w-4 mr-2" /> Kalıcı Olarak Sil
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardHeader>

                                <CardContent className="relative z-10 pt-2 pb-5 space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                                                Erişim Kapasitesi
                                            </span>
                                            <span className="font-semibold text-foreground">{role.permissions.length} <span className="text-muted-foreground font-normal">/ {AVAILABLE_MODULES.length}</span></span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ease-out ${role.permissions.length === AVAILABLE_MODULES.length ? 'bg-emerald-500' : 'bg-primary'}`}
                                                style={{ width: `${(role.permissions.length / AVAILABLE_MODULES.length) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Permissions badges */}
                                    <div className="flex flex-wrap gap-1.5">
                                        {role.permissions.slice(0, 3).map(p => {
                                            const mod = AVAILABLE_MODULES.find(m => m.id === p)
                                            return <Badge key={p} variant="outline" className="bg-background/50 text-[11px] font-medium border-muted-foreground/20 text-muted-foreground group-hover:border-primary/20 group-hover:text-foreground transition-colors">
                                                {mod?.label || p}
                                            </Badge>
                                        })}
                                        {role.permissions.length > 3 && (
                                            <Badge variant="secondary" className="text-[11px] font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                                +{role.permissions.length - 3} Modül
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Genel Güvenlik Kriterleri</CardTitle>
                            <CardDescription>Uygulama genelinde zorunlu kılınan güvenlik politikaları.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-base font-medium flex items-center gap-2"><Smartphone className="h-4 w-4" /> İki Aşamalı Doğrulama (2FA) Zorunluluğu</label>
                                    <p className="text-sm text-muted-foreground">Tüm aktif personel girişte SMS/Authenticator kullanmaya zorlanacaktır.</p>
                                </div>
                                <Switch
                                    disabled={settingsLoading}
                                    checked={getSettingValue("Security_2FA_Enabled") === "true"}
                                    onCheckedChange={() => toggleSetting("Security_2FA_Enabled", "Security", "İki Aşamalı Doğrulama (2FA) durumu")}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-base font-medium flex items-center gap-2"><Key className="h-4 w-4" /> Güçlü Şifre Politikası</label>
                                    <p className="text-sm text-muted-foreground">Şifreler en az 8 karakter, 1 büyük harf ve 1 özel karakter içermelidir.</p>
                                </div>
                                <Switch
                                    disabled={settingsLoading}
                                    checked={getSettingValue("Security_StrongPassword_Required") === "true"}
                                    onCheckedChange={() => toggleSetting("Security_StrongPassword_Required", "Security", "Güçlü şifre politikası")}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-base font-medium">Oturum Zaman Aşımı (Session Timeout)</label>
                                    <p className="text-sm text-muted-foreground">Kullanıcı 30 dakika işlem yapmazsa sistemden otomatik çıkış yapılsın.</p>
                                </div>
                                <Switch
                                    disabled={settingsLoading}
                                    checked={getSettingValue("Security_SessionTimeout_Minutes") !== "0"}
                                    onCheckedChange={() => toggleSetting("Security_SessionTimeout_Minutes", "Security", "Oturum zaman aşımı süresi")}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-4">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Tema Özelleştirme</CardTitle>
                            <CardDescription>Sistem arayüzünün görünümünü (Aydınlık/Karanlık) ve kurumsal ana rengini yapılandırın.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-base font-medium">Sistem Modu</label>
                                <div className="flex gap-4">
                                    <Button
                                        variant={mounted && theme === 'light' ? 'default' : 'outline'}
                                        onClick={() => setTheme('light')}
                                        className="w-32"
                                    >
                                        Aydınlık
                                    </Button>
                                    <Button
                                        variant={mounted && theme === 'dark' ? 'default' : 'outline'}
                                        onClick={() => setTheme('dark')}
                                        className="w-32"
                                    >
                                        Karanlık
                                    </Button>
                                    <Button
                                        variant={mounted && theme === 'system' ? 'default' : 'outline'}
                                        onClick={() => setTheme('system')}
                                        className="w-32"
                                    >
                                        Sistem Otomatik
                                    </Button>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <label className="text-base font-medium">Kurumsal Ana Renk (Primary Color)</label>
                                <p className="text-sm text-muted-foreground mb-4">Uygulamanın butonlarında, linklerinde ve aktif öğelerinde kullanılacak rengi seçin.</p>

                                <div className="flex flex-wrap gap-4">
                                    {(['blue', 'rose', 'emerald', 'violet', 'amber', 'neutral'] as ThemePrimaryColor[]).map((color) => {
                                        const colorMap: Record<string, string> = {
                                            blue: 'bg-blue-600',
                                            rose: 'bg-rose-600',
                                            emerald: 'bg-emerald-600',
                                            violet: 'bg-violet-600',
                                            amber: 'bg-amber-500',
                                            neutral: 'bg-zinc-900 dark:bg-zinc-200'
                                        };
                                        const nameMap: Record<string, string> = {
                                            blue: 'Okyanus Mavisi',
                                            rose: 'Lale Rengi (Gül)',
                                            emerald: 'Zümrüt Yeşili',
                                            violet: 'Derin Mor',
                                            amber: 'Kehribar',
                                            neutral: 'Siyah / Beyaz (Sade)'
                                        };
                                        const isActive = primaryColor === color;

                                        return (
                                            <div
                                                key={color}
                                                onClick={() => setPrimaryColor(color)}
                                                className={`flex flex-col items-center gap-2 cursor-pointer p-3 rounded-lg border-2 transition-all ${isActive ? 'border-primary bg-primary/5 scale-105' : 'border-transparent hover:bg-muted/50'}`}
                                            >
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorMap[color]} shadow-md ring-2 ring-offset-2 ring-offset-background ${isActive ? 'ring-primary' : 'ring-transparent'}`}>
                                                    {isActive && <Check className="h-6 w-6 text-white dark:text-black" />}
                                                </div>
                                                <span className="text-xs font-medium text-center">{nameMap[color]}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Bildirim Kuralları</CardTitle>
                            <CardDescription>Sistemdeki olaylara bağlı olarak e-posta bildirimlerini yönetin.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/10">
                                    <div>
                                        <h5 className="font-medium text-sm">Yeni Müşteri (Lead) Kayıt Bildirimi</h5>
                                        <p className="text-xs text-muted-foreground mt-1">Sisteme yeni bir müşteri eklendiğinde Satış ekibine mail atılır.</p>
                                    </div>
                                    <Switch
                                        disabled={settingsLoading}
                                        checked={getSettingValue("Notify_NewLead_Email") === "true"}
                                        onCheckedChange={() => toggleSetting("Notify_NewLead_Email", "Notification", "Yeni müşteri kayıt bildirimi")}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/10">
                                    <div>
                                        <h5 className="font-medium text-sm">Kazanılan Fırsat (Won Deal)</h5>
                                        <p className="text-xs text-muted-foreground mt-1">Pipeline'da fırsat kazanıldı statüsüne geçerse tüm yönetimi bilgilendir.</p>
                                    </div>
                                    <Switch
                                        disabled={settingsLoading}
                                        checked={getSettingValue("Notify_WonDeal_Management") === "true"}
                                        onCheckedChange={() => toggleSetting("Notify_WonDeal_Management", "Notification", "Kazanılan fırsat bildirimi")}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/10">
                                    <div>
                                        <h5 className="font-medium text-sm">Finansal Limit Alarmı</h5>
                                        <p className="text-xs text-muted-foreground mt-1">Nakit girişi/çıkışı belirlenen eşiklerin üzerine çıktığında finans yetkilisine haber ver.</p>
                                    </div>
                                    <Switch
                                        disabled={settingsLoading}
                                        defaultChecked
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Kullanıcıyı Silmek İstediğinize Emin Misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu işlem geri alınamaz. Kullanıcının sisteme erişimi derhal kesilecek ve tüm yetkileri iptal edilecektir. Geçmiş işlem kayıtları yedeklenecektir.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Kullanıcıyı Sil</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingRole ? "Rolü Düzenle" : "Yeni Rol Ekle"}</DialogTitle>
                        <DialogDescription>
                            {editingRole?.isDefault
                                ? "Varsayılan yönetici rolünün yetkileri değiştirilemez ancak inceleyebilirsiniz."
                                : "Rol adını ve erişim belirleyeceğiniz modülleri seçin."}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...roleForm}>
                        <form onSubmit={roleForm.handleSubmit(onRoleSubmit)} className="space-y-4">
                            <FormField
                                control={roleForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Rol Adı</FormLabel>
                                        <FormControl>
                                            <Input disabled={editingRole?.isDefault} placeholder="Örn: Pazarlama Uzmanı" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={roleForm.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Açıklama</FormLabel>
                                        <FormControl>
                                            <Input disabled={editingRole?.isDefault} placeholder="Rolün genel yetkilerini açıklayın" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div>
                                <FormLabel className="mb-2 block mt-2">Erişim İzinleri (Modüller)</FormLabel>
                                <div className="border rounded-md p-4 space-y-3 max-h-[250px] overflow-y-auto">
                                    {AVAILABLE_MODULES.map(module => (
                                        <FormField
                                            key={module.id}
                                            control={roleForm.control}
                                            name="permissions"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between space-y-0">
                                                    <FormLabel className="text-sm font-normal cursor-pointer flex-1">
                                                        {module.label}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Switch
                                                            disabled={editingRole?.isDefault}
                                                            checked={field.value?.includes(module.id)}
                                                            onCheckedChange={(checked) => {
                                                                return checked
                                                                    ? field.onChange([...field.value, module.id])
                                                                    : field.onChange(field.value?.filter((value) => value !== module.id))
                                                            }}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </div>
                                {roleForm.formState.errors.permissions && (
                                    <p className="text-sm font-medium text-destructive mt-2">{roleForm.formState.errors.permissions.message}</p>
                                )}
                            </div>
                            <div className="pt-4 border-t flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsRoleDialogOpen(false)}>Kapat</Button>
                                {!editingRole?.isDefault && <Button type="submit">Kaydet</Button>}
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteRoleDialogOpen} onOpenChange={setIsDeleteRoleDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Rolü Silmek İstediğinize Emin Misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu işlem geri alınamaz. Bu role sahip mevcut kullanıcılar varsa sisteme erişirken beklenmeyen sorunlar yaşayabilirler. Modüllere erişimi hemen kesilir.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteRole} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Rolü Sil</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageWrapper>
    )
}
