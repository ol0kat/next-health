"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"
import Link from "next/link"
import type { ReactNode } from "react"

interface BreadcrumbNavProps {
  items: {
    label: string
    href?: string
    active?: boolean
    onClick?: () => void
  }[]
  className?: string
  actions?: ReactNode
}

export function BreadcrumbNav({ items, className, actions }: BreadcrumbNavProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-6 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className,
      )}
    >
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, index) => (
            <div key={item.label} className="flex items-center">
              {index > 0 && <BreadcrumbSeparator className="mx-2" />}
              <BreadcrumbItem>
                {item.active ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : item.href ? (
                  <Link href={item.href} legacyBehavior passHref>
                    <BreadcrumbLink className="cursor-pointer hover:text-foreground transition-colors">
                      {item.label}
                    </BreadcrumbLink>
                  </Link>
                ) : (
                  <BreadcrumbLink
                    asChild
                    onClick={(e) => {
                      if (item.onClick) {
                        e.preventDefault()
                        item.onClick()
                      }
                    }}
                    className={cn(
                      "text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
                      !item.onClick && "pointer-events-none",
                    )}
                  >
                    <span>{item.label}</span>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
