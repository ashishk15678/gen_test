"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PullRequestHandler = void 0;
const review_service_1 = require("../services/review.service");
class PullRequestHandler {
    static async handle(octokit, payload) {
        const pr = payload.pull_request;
        console.log(`Received PR event for ${pr.html_url}`);
        if (pr.state !== "open") {
            return;
        }
        try {
            const owner = payload.repository.owner.login;
            const repo = payload.repository.name;
            const pull_number = pr.number;
            const review = await review_service_1.ReviewService.review(octokit, owner, repo, pull_number);
            await octokit.rest.issues.createComment({
                owner,
                repo,
                issue_number: pull_number,
                body: review,
            });
            console.log("Posted review comment");
        }
        catch (error) {
            console.error("Failed to review PR", error);
        }
    }
}
exports.PullRequestHandler = PullRequestHandler;
