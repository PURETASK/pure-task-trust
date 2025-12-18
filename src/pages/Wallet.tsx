import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, Clock, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

const transactions = [
  {
    id: "1",
    type: "purchase",
    amount: 100,
    description: "Credit purchase",
    date: "Dec 18, 2024",
    status: "completed",
  },
  {
    id: "2",
    type: "payment",
    amount: -96,
    description: "Cleaning - Sarah M.",
    date: "Dec 15, 2024",
    status: "completed",
  },
  {
    id: "3",
    type: "refund",
    amount: 9,
    description: "Unused time refund",
    date: "Dec 15, 2024",
    status: "completed",
  },
  {
    id: "4",
    type: "hold",
    amount: -105,
    description: "Pending cleaning",
    date: "Dec 20, 2024",
    status: "held",
  },
];

export default function Wallet() {
  const availableCredits = 208;
  const heldCredits = 105;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold mb-8">Wallet</h1>

            {/* Balance Cards */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-primary-foreground/80">Available</span>
                    <WalletIcon className="h-5 w-5 text-primary-foreground/60" />
                  </div>
                  <p className="text-4xl font-bold mb-1">{availableCredits}</p>
                  <p className="text-sm text-primary-foreground/70">credits</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-muted-foreground">Held</span>
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-4xl font-bold mb-1 text-warning">{heldCredits}</p>
                  <p className="text-sm text-muted-foreground">credits for pending jobs</p>
                </CardContent>
              </Card>
            </div>

            {/* Buy Credits */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">Need more credits?</h3>
                    <p className="text-sm text-muted-foreground">1 credit = $1 USD</p>
                  </div>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Buy Credits
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
                    >
                      <div
                        className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                          transaction.type === "purchase"
                            ? "bg-success/10"
                            : transaction.type === "refund"
                            ? "bg-success/10"
                            : transaction.type === "hold"
                            ? "bg-warning/10"
                            : "bg-secondary"
                        }`}
                      >
                        {transaction.type === "purchase" ? (
                          <ArrowDownLeft className="h-5 w-5 text-success" />
                        ) : transaction.type === "refund" ? (
                          <ArrowDownLeft className="h-5 w-5 text-success" />
                        ) : transaction.type === "hold" ? (
                          <Clock className="h-5 w-5 text-warning" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5 text-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{transaction.date}</p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            transaction.amount > 0
                              ? "text-success"
                              : transaction.status === "held"
                              ? "text-warning"
                              : ""
                          }`}
                        >
                          {transaction.amount > 0 ? "+" : ""}
                          {transaction.amount}
                        </p>
                        {transaction.status === "held" && (
                          <Badge variant="warning" className="text-xs">Held</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Note */}
            <p className="text-sm text-muted-foreground text-center mt-6">
              Credits cannot be refunded to cash. They can only be used for bookings.
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
