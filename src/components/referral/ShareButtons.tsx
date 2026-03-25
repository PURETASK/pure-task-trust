import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Mail, MessageSquare, Share2, Check } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { track } from "@/lib/tracking";

interface ShareButtonsProps {
  referralLink: string;
  referralCode: string;
  rewardAmount?: number;
  variant?: "grid" | "inline";
  className?: string;
}

export function ShareButtons({ 
  referralLink, 
  referralCode, 
  rewardAmount = 25,
  variant = "grid",
  className = ""
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareMessage = `Join PureTask using my referral link and we'll both get $${rewardAmount}! ${referralLink}`;
  const emailSubject = encodeURIComponent("Join PureTask and get $" + rewardAmount + "!");
  const emailBody = encodeURIComponent(
    `Hey! I've been using PureTask for cleaning services and it's been great. Use my referral link to sign up and we'll both get $${rewardAmount}!\n\n${referralLink}`
  );

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    track('ui.action_clicked', { action_name: 'referral_link_copied', method: 'copy' });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaEmail = () => {
    window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`);
    track('ui.action_clicked', { action_name: 'referral_shared', method: 'email' });
  };

  const shareViaSMS = () => {
    const text = encodeURIComponent(shareMessage);
    window.open(`sms:?body=${text}`);
    track('ui.action_clicked', { action_name: 'referral_shared', method: 'sms' });
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(shareMessage);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    track('ui.action_clicked', { action_name: 'referral_shared', method: 'whatsapp' });
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join PureTask',
          text: `Use my referral code to get $${rewardAmount}!`,
          url: referralLink,
        });
        track('ui.action_clicked', { action_name: 'referral_shared', method: 'native' });
      } catch (err) {
        // User cancelled or share failed - silently ignore
      }
    }
  };

  const buttons = [
    { icon: Copy, label: copied ? "Copied!" : "Copy Link", onClick: copyLink, active: copied },
    { 
      icon: () => (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ), 
      label: "WhatsApp", 
      onClick: shareViaWhatsApp 
    },
    { icon: MessageSquare, label: "SMS", onClick: shareViaSMS },
    { icon: Mail, label: "Email", onClick: shareViaEmail },
  ];

  // Add native share if available
  if (typeof navigator.share === 'function') {
    buttons.push({ icon: Share2, label: "Share", onClick: shareNative });
  }

  if (variant === "inline") {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {buttons.map((btn) => (
          <Button
            key={btn.label}
            variant={btn.active ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={btn.onClick}
          >
            <AnimatePresence mode="wait">
              {btn.active ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check className="h-4 w-4" />
                </motion.div>
              ) : (
                <btn.icon className="h-4 w-4" />
              )}
            </AnimatePresence>
            {btn.label}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-${Math.min(buttons.length, 4)} gap-3 ${className}`}>
      {buttons.map((btn) => (
        <Button
          key={btn.label}
          variant={btn.active ? "default" : "outline"}
          className="gap-2"
          onClick={btn.onClick}
        >
          <AnimatePresence mode="wait">
            {btn.active ? (
              <motion.div
                key="check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Check className="h-4 w-4" />
              </motion.div>
            ) : (
              <btn.icon className="h-4 w-4" />
            )}
          </AnimatePresence>
          {btn.label}
        </Button>
      ))}
    </div>
  );
}
