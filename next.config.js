/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  env: {
    JWT_PUBLIC_KEY: process.env.JWT_PUBLIC_KEY,
    JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY,
    MONGODB_REALM_ID: process.env.MONGODB_REALM_ID
  },
  images: {
    domains: [
      "127.0.0.1",
      "ui-avatars.com",
      "docs.google.com",
      "drive.google.com",
      "cdn.discordapp.com",
      "infile-helper.deno.dev",
      "lh3.googleusercontent.com",
      "lh4.googleusercontent.com",
      "lh6.googleusercontent.com",
      "lh5.googleusercontent.com",
      "yptorid-my.sharepoint.com",
      "drive-thirdparty.googleusercontent.com"
    ]
  }
}
