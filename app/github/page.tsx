import { Suspense } from "react";
import GitHubAnalytics from "./GithubAnalytics";

export default function Github() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <GitHubAnalytics />
        </Suspense>
    );
}