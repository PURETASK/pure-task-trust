import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      // Wave 1 — primitive boundary enforcement.
      // Block raw reads of money fields outside useJobMoney + allowlisted boundary files.
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[property.name='escrow_credits_reserved']",
          message:
            "Do not read escrow_credits_reserved directly. Use useJobMoney(job).escrowHeld / .cleanerNet — see docs/REFACTOR_WAVE_1_2_AUDIT.md.",
        },
        {
          selector: "MemberExpression[property.name='final_charge_credits']",
          message:
            "Do not read final_charge_credits directly. Use useJobMoney(job).finalCharge — see docs/REFACTOR_WAVE_1_2_AUDIT.md.",
        },
      ],
    },
  },
  // Allowlist: files that legitimately bridge the database boundary
  // (useJobMoney owns the math; the rest select / type / aggregate the
  // raw column for Supabase queries or hand it off to useJobMoney).
  {
    files: [
      "src/hooks/useJobMoney.ts",
      "src/hooks/useCleanerEarnings.ts",
      "src/hooks/useAdminStats.ts",
      "src/hooks/useClientLifetimeValue.ts",
      "src/hooks/useClientHome.ts",
      "src/hooks/useClientDashboard.ts",
      "src/hooks/useReferralAttribution.ts",
      "src/hooks/useAutoRebook.ts",
      "src/hooks/useDisputes.ts",
      "src/hooks/useJobOffers.ts",
      "src/hooks/useJobAuthorization.ts",
      "src/hooks/useCleanerAI.ts",
      "src/components/admin/UserInspectorPanel.tsx",
      "src/pages/admin/AdminDisputes.tsx",
      "src/pages/admin/AdminBookingsConsole.tsx",
      "src/pages/BookingStatus.tsx",
      "src/pages/CleaningDetail.tsx",
      "src/pages/JobApproval.tsx",
      "src/pages/cleaner/CleanerJobDetail.tsx",
      "src/pages/MyCleanings.tsx",
      "src/pages/JobInProgress.tsx",
      "src/pages/cleaner/CleanerJobs.tsx",
      "src/pages/cleaner/CleanerSchedule.tsx",
      "src/components/client-home/UpcomingCleaningCard.tsx",
      "src/components/client-home/RecentActivityTimeline.tsx",
      "src/components/client-home/QuickRebookSection.tsx",
    ],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
);
