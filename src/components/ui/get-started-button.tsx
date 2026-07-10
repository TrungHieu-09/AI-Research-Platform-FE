"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

interface GetStartedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export function GetStartedButton({ children = "Bắt đầu miễn phí", ...props }: GetStartedButtonProps) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (props.onClick) {
      props.onClick(e)
    }

    let isAuthenticated = false
    try {
      isAuthenticated = !!localStorage.getItem("lumis_auth")
    } catch {
      // ignore
    }
    
    if (isAuthenticated) {
      router.push("/user/library")
    } else {
      router.push("/signup")
    }
  }

  return (
    <button {...props} onClick={handleClick}>
      {children}
    </button>
  )
}
