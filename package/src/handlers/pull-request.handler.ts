import { Octokit } from "octokit";
import { ReviewService } from "../services/review.service";

export class PullRequestHandler {
  static async handle(octokit: Octokit, payload: any) {
    const pr = payload.pull_request;
    console.log(`Received PR event for ${pr.html_url}`);

    if (pr.state !== "open") {
      return;
    }

    try {
      const owner = payload.repository.owner.login;
      const repo = payload.repository.name;
      const pull_number = pr.number;

      const review = await ReviewService.review(octokit, owner, repo, pull_number);

      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: pull_number,
        body: review,
      });
      console.log("Posted review comment");
    } catch (error) {
      console.error("Failed to review PR", error);
    }
  }
}
