CREATE TABLE `approvals` (
	`id` text PRIMARY KEY NOT NULL,
	`mandate_id` text NOT NULL,
	`cart` text NOT NULL,
	`decision` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	`resolved_at` text
);
--> statement-breakpoint
CREATE TABLE `audit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`mandate_id` text,
	`type` text NOT NULL,
	`detail` text NOT NULL,
	`risk_score` real,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `mandates` (
	`id` text PRIMARY KEY NOT NULL,
	`user_prompt` text NOT NULL,
	`body` text NOT NULL,
	`status` text NOT NULL,
	`signature` text,
	`expires_at` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `proofs` (
	`id` text PRIMARY KEY NOT NULL,
	`mandate_id` text NOT NULL,
	`paypal_order_id` text NOT NULL,
	`body` text NOT NULL,
	`hash` text NOT NULL,
	`signature` text NOT NULL,
	`created_at` text NOT NULL
);
