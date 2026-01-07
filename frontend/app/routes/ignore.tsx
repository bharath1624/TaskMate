import type { LoaderFunctionArgs } from "react-router";

export function loader(_: LoaderFunctionArgs) {
    return new Response(null, { status: 204 });
}

export default function Ignore() {
    return null;
}
