// Vite turns an imported picture into its address in the build.
declare module "*.svg" {
  const address: string;
  export default address;
}
