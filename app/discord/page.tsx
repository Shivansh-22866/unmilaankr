import { Suspense } from "react";
import DiscordAnalytics from "./DiscordAnalytics";

export default function Discord() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DiscordAnalytics />
        </Suspense>
    );
}