
export default function signInWithRedirectUrl(authUrl: string) {
    if (!authUrl) return;

    const redirect_url = window.location.href;

    const authURL = new URL(authUrl);
    const state = authURL.searchParams.get("state")!;
    authURL.searchParams.set("state", `${state}...Novrii...${redirect_url}`);

    window.open(authURL, "_self", "noopener,noreferrer");
}