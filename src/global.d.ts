declare module "*.jpg"
declare module "*.webp"

declare module "*.json" {
  const value: any
  export default value
}