import { Suspense } from "react";
import OnchainAnalytics from "./OnchainAnalytics";

export default function Discord() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OnchainAnalytics />
        </Suspense>
    );
}