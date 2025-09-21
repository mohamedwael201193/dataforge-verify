import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        
        // DataForge Hub custom variants
        hero: "bg-gradient-ai text-white hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-glow",
        glass: "glass-card text-foreground hover:bg-white/10 backdrop-blur-sm transition-all duration-300",
        pdp: "pdp-verified hover:opacity-90 shadow-md hover:shadow-lg transition-all duration-300",
        pay: "pay-active hover:opacity-90 shadow-md hover:shadow-lg transition-all duration-300",
        ai: "bg-ai-blue text-white hover:bg-ai-purple transition-all duration-500 shadow-lg hover:shadow-ai-blue/25",
        premium: "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white hover:scale-105 transform transition-all duration-300 shadow-lg",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-lg px-12 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);