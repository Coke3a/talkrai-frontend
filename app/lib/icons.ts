import type { LucideIcon } from "lucide-react";
import {
  Sparkles,
  MessageCircle,
  CreditCard,
  Gift,
  RotateCcw,
  Wrench,
  FileText,
  Smile,
  Frown,
  Angry,
  Meh,
  Laugh,
  AlertCircle,
  HeartCrack,
  Heart,
  UserPlus,
  Hand,
  HeartHandshake,
} from "lucide-react";

// ── Transaction Icons ────────────────────────────────────

const TRANSACTION_ICONS: Record<string, LucideIcon> = {
  consumption: MessageCircle,
  purchase: CreditCard,
  bonus: Gift,
  refund: RotateCcw,
  adjustment: Wrench,
};

export function getTransactionIcon(type: string): LucideIcon {
  return TRANSACTION_ICONS[type] ?? FileText;
}

// ── Mood Icons ───────────────────────────────────────────

const MOOD_ICONS: Record<string, LucideIcon> = {
  happy: Smile,
  sad: Frown,
  angry: Angry,
  neutral: Meh,
  excited: Sparkles,
  shy: HeartCrack,
  playful: Laugh,
  serious: Meh,
  worried: AlertCircle,
};

export function getMoodIcon(mood: string): LucideIcon {
  return MOOD_ICONS[mood] ?? Meh;
}

// ── Relationship Icons ───────────────────────────────────

const RELATIONSHIP_ICONS: Record<string, LucideIcon> = {
  stranger: UserPlus,
  acquaintance: Hand,
  friend: Heart,
  close_friend: HeartHandshake,
};

export function getRelationshipIcon(level: string): LucideIcon {
  return RELATIONSHIP_ICONS[level] ?? UserPlus;
}
