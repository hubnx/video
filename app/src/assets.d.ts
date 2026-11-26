// Vite turns an imported picture into its address in the build.
declare module "*.svg" {
  const address: string;
  export default address;
}

// Vite turns `?url` on any import into the address of that file in the build (the face detector's WASM and model).
declare module "*?url" {
  const address: string;
  export default address;
}
