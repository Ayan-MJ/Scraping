"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { CreditCard, ArrowRight } from "lucide-react"
import { useState } from "react"
import { UsageChart } from "@/components/account-settings/usage-chart"
import type { AccountSettings } from "@/app/account/settings/page"

interface BillingSettingsProps {
  settings: AccountSettings
  onChange: (settings: Partial<AccountSettings>) => void
}

export function BillingSettings({ settings, onChange }: BillingSettingsProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-[#4F46E5] mb-4">Billing & Usage</h2>
        <p className="text-sm text-muted-foreground mb-6">Manage your subscription plan and monitor your usage.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-base font-medium">Current Plan</h3>
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-[#4F46E5]/5 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xl font-semibold">{settings.billing.plan.name}</h4>
                    <Badge className="bg-[#4F46E5]">{settings.billing.plan.cost}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{settings.billing.plan.description}</p>
                </div>
                <Button
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="bg-[#4F46E5] hover:bg-[#4338CA] whitespace-nowrap"
                >
                  Upgrade / Change Plan
                </Button>
              </div>
            </div>
            <div className="p-6">
              <h5 className="text-sm font-medium mb-4">Plan Features</h5>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {settings.billing.plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="#4F46E5"
                      className="w-5 h-5 flex-shrink-0"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-medium">Usage Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UsageCard
              title="Jobs Run"
              current={settings.billing.usage.jobsRun.current}
              limit={settings.billing.usage.jobsRun.limit}
              history={settings.billing.usage.jobsRun.history}
            />
            <UsageCard
              title="Data Records"
              current={settings.billing.usage.dataRecords.current}
              limit={settings.billing.usage.dataRecords.limit}
              history={settings.billing.usage.dataRecords.history}
            />
            <UsageCard
              title="Proxy Calls"
              current={settings.billing.usage.proxyCalls.current}
              limit={settings.billing.usage.proxyCalls.limit}
              history={settings.billing.usage.proxyCalls.history}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-medium">Payment Method</h3>
          <div className="border rounded-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-muted rounded-md p-2">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium">
                    {settings.billing.paymentMethod.cardType} ending in {settings.billing.paymentMethod.lastFour}
                  </p>
                  <p className="text-sm text-muted-foreground">Expires {settings.billing.paymentMethod.expiryDate}</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setIsPaymentModalOpen(true)}>
                Update Payment Method
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Update Payment Method Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Payment Method</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-muted-foreground">
              This is a demo. In a real application, this would integrate with a payment processor like Stripe.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsPaymentModalOpen(false)} className="bg-[#4F46E5] hover:bg-[#4338CA]">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Plan Modal */}
      <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Choose a Plan</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <PlanCard
              name="Professional"
              price="$49/month"
              description="For teams and advanced scraping needs"
              features={[
                "Unlimited projects",
                "10,000 pages/month",
                "Advanced anti-bot protection",
                "Team collaboration",
                "API access",
              ]}
              isCurrentPlan={true}
              onSelect={() => setIsUpgradeModalOpen(false)}
            />
            <PlanCard
              name="Enterprise"
              price="$199/month"
              description="For large-scale scraping operations"
              features={[
                "Unlimited projects",
                "100,000 pages/month",
                "Premium anti-bot protection",
                "Advanced team management",
                "Priority support",
                "Custom integrations",
              ]}
              isCurrentPlan={false}
              onSelect={() => setIsUpgradeModalOpen(false)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpgradeModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface UsageCardProps {
  title: string
  current: number
  limit: number
  history: number[]
}

function UsageCard({ title, current, limit, history }: UsageCardProps) {
  const percentage = Math.round((current / limit) * 100)
  const isNearLimit = percentage >= 80

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>This Month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold">{current.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground">of {limit.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${isNearLimit ? "bg-amber-500" : "bg-[#4F46E5]"}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-muted-foreground text-right">{percentage}% used</div>
        </div>
        <div className="h-24 mt-4">
          <UsageChart data={history} />
        </div>
      </CardContent>
    </Card>
  )
}

interface PlanCardProps {
  name: string
  price: string
  description: string
  features: string[]
  isCurrentPlan: boolean
  onSelect: () => void
}

function PlanCard({ name, price, description, features, isCurrentPlan, onSelect }: PlanCardProps) {
  return (
    <Card className={isCurrentPlan ? "border-[#4F46E5]" : ""}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          {isCurrentPlan && <Badge className="bg-[#4F46E5]">Current</Badge>}
        </div>
        <div className="mt-2">
          <span className="text-2xl font-bold">{price}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#4F46E5"
                className="w-5 h-5 flex-shrink-0"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          onClick={onSelect}
          className={`w-full ${
            isCurrentPlan ? "bg-muted text-muted-foreground hover:bg-muted/80" : "bg-[#4F46E5] hover:bg-[#4338CA]"
          }`}
          disabled={isCurrentPlan}
        >
          {isCurrentPlan ? "Current Plan" : "Select Plan"}
          {!isCurrentPlan && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </CardFooter>
    </Card>
  )
}
