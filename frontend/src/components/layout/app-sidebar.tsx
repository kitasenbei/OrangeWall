import { useState } from "react"
import { NavLink } from "react-router-dom"
import { LogOut, ChevronRight, Sun, Moon, Monitor, Star, StarOff } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { navGroups, mainNavItems } from "@/config/navigation"
import { useAuth } from "@/stores/auth-context"
import { useTheme } from "@/stores/theme-context"
import { usePreferences } from "@/stores/preferences-context"
import { OrangeLogo } from "@/components/common/orange-logo"

export function AppSidebar() {
  const { user, logout } = useAuth()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { favoriteTools, toggleFavorite, isFavorite } = usePreferences()
  const [openGroups, setOpenGroups] = useState<string[]>(["Favorites", "Productivity"])

  const toggleGroup = (title: string) => {
    setOpenGroups(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    )
  }

  // Get favorite items from nav
  const favoriteItems = mainNavItems.filter(item => favoriteTools.includes(item.href))

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <OrangeLogo className="size-9 shrink-0 drop-shadow-sm" />
          <div className="group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-base">Orangewall</span>
            <p className="text-xs text-sidebar-foreground/60">Your life, organized</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Favorites Section */}
        {favoriteItems.length > 0 && (
          <Collapsible
            open={openGroups.includes("Favorites")}
            onOpenChange={() => toggleGroup("Favorites")}
            className="group/collapsible"
          >
            <SidebarGroup className="py-1">
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center gap-2 cursor-pointer hover:bg-sidebar-accent rounded-md px-2 py-1.5 transition-colors">
                  <Star className="size-4 text-yellow-500 fill-yellow-500" />
                  <span className="flex-1 text-left font-medium">Favorites</span>
                  <ChevronRight className="size-4 text-sidebar-foreground/50 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenuSub>
                    {favoriteItems.map((item) => (
                      <SidebarMenuSubItem key={item.href}>
                        <ContextMenu>
                          <ContextMenuTrigger asChild>
                            <SidebarMenuSubButton asChild>
                              <NavLink to={item.href}>
                                {({ isActive }) => (
                                  <>
                                    <item.icon className={`size-4 ${isActive ? "text-primary" : ""}`} />
                                    <span className={isActive ? "font-medium text-primary" : ""}>{item.title}</span>
                                  </>
                                )}
                              </NavLink>
                            </SidebarMenuSubButton>
                          </ContextMenuTrigger>
                          <ContextMenuContent>
                            <ContextMenuItem onClick={() => toggleFavorite(item.href)}>
                              <StarOff className="size-4 mr-2" />
                              Remove from Favorites
                            </ContextMenuItem>
                          </ContextMenuContent>
                        </ContextMenu>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}

        {/* Regular Nav Groups */}
        {navGroups.map((group) => (
          <Collapsible
            key={group.title}
            open={openGroups.includes(group.title)}
            onOpenChange={() => toggleGroup(group.title)}
            className="group/collapsible"
          >
            <SidebarGroup className="py-1">
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center gap-2 cursor-pointer hover:bg-sidebar-accent rounded-md px-2 py-1.5 transition-colors">
                  <group.icon className="size-4 text-primary/80" />
                  <span className="flex-1 text-left font-medium">{group.title}</span>
                  <ChevronRight className="size-4 text-sidebar-foreground/50 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenuSub>
                    {group.items.map((item) => (
                      <SidebarMenuSubItem key={item.href}>
                        <ContextMenu>
                          <ContextMenuTrigger asChild>
                            <SidebarMenuSubButton asChild>
                              <NavLink to={item.href}>
                                {({ isActive }) => (
                                  <>
                                    <item.icon className={`size-4 ${isActive ? "text-primary" : ""}`} />
                                    <span className={isActive ? "font-medium text-primary" : ""}>{item.title}</span>
                                    {isFavorite(item.href) && (
                                      <Star className="size-3 ml-auto text-yellow-500 fill-yellow-500" />
                                    )}
                                  </>
                                )}
                              </NavLink>
                            </SidebarMenuSubButton>
                          </ContextMenuTrigger>
                          <ContextMenuContent>
                            <ContextMenuItem onClick={() => toggleFavorite(item.href)}>
                              {isFavorite(item.href) ? (
                                <>
                                  <StarOff className="size-4 mr-2" />
                                  Remove from Favorites
                                </>
                              ) : (
                                <>
                                  <Star className="size-4 mr-2" />
                                  Add to Favorites
                                </>
                              )}
                            </ContextMenuItem>
                          </ContextMenuContent>
                        </ContextMenu>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton tooltip="Theme">
                  {resolvedTheme === "dark" ? (
                    <Moon className="size-4" />
                  ) : (
                    <Sun className="size-4" />
                  )}
                  <span className="truncate">
                    {theme === "system" ? "System" : theme === "dark" ? "Dark" : "Light"}
                  </span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-40">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="size-4 mr-2" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="size-4 mr-2" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Monitor className="size-4 mr-2" />
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
          <SidebarSeparator />
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip="Sign out">
              <LogOut className="size-4" />
              <span className="truncate">{user?.email || "Sign out"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
