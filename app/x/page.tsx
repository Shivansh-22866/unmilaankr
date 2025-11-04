import { Suspense } from "react";
import XAnalytics from "./XAnalytics";

export default function Discord() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <XAnalytics/>
        </Suspense>
    );
}