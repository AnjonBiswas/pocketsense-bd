import React from "react";
import "@testing-library/jest-dom";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn()
  }),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams()
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    return React.createElement("img", { ...props, alt: props.alt || "" });
  }
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    React.createElement("a", { href, ...props }, children)
  )
}));

jest.mock("next/font/google", () => ({
  Hind_Siliguri: () => ({
    className: "font-hind-siliguri",
    variable: "--font-hind-siliguri"
  })
}));

class ResizeObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}

if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false
    })
  });

  Object.defineProperty(window, "scrollTo", {
    writable: true,
    value: () => undefined
  });

  Object.defineProperty(window, "ResizeObserver", {
    writable: true,
    value: ResizeObserverMock
  });
}
