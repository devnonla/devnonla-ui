import type { ComponentType } from "react";
import { BellIcon } from "@solar-icons/react/outline/bell";
import { BookmarkIcon } from "@solar-icons/react/outline/bookmark";
import { BotIcon } from "@solar-icons/react/outline/bot";
import { CalendarIcon } from "@solar-icons/react/outline/calendar";
import { ChartIcon } from "@solar-icons/react/outline/chart";
import { ChatRoundDotsIcon } from "@solar-icons/react/outline/chat-round-dots";
import { ChatRoundIcon } from "@solar-icons/react/outline/chat-round";
import { CheckSquareIcon } from "@solar-icons/react/outline/check-square";
import { ClipboardListIcon } from "@solar-icons/react/outline/clipboard-list";
import { ClipboardTextIcon } from "@solar-icons/react/outline/clipboard-text";
import { ClockCircleIcon } from "@solar-icons/react/outline/clock-circle";
import { CodeIcon } from "@solar-icons/react/outline/code";
import { CodeSquareIcon } from "@solar-icons/react/outline/code-square";
import { DialogIcon } from "@solar-icons/react/outline/dialog";
import { DocumentTextIcon } from "@solar-icons/react/outline/document-text";
import { GalleryIcon } from "@solar-icons/react/outline/gallery";
import { GalleryRemoveIcon } from "@solar-icons/react/outline/gallery-remove";
import { HamburgerMenuIcon } from "@solar-icons/react/outline/hamburger-menu";
import { HashtagSquareIcon } from "@solar-icons/react/outline/hashtag-square";
import { LayersIcon } from "@solar-icons/react/outline/layers";
import { LibraryIcon } from "@solar-icons/react/outline/library";
import { LightbulbIcon } from "@solar-icons/react/outline/lightbulb";
import { ListIcon } from "@solar-icons/react/outline/list";
import { MagicWand3Icon } from "@solar-icons/react/outline/magic-wand-3";
import { NotesIcon } from "@solar-icons/react/outline/notes";
import { PaintBrushIcon } from "@solar-icons/react/outline/paint-brush";
import { PaletteIcon } from "@solar-icons/react/outline/palette";
import { PlayCircleIcon } from "@solar-icons/react/outline/play-circle";
import { QuestionCircleIcon } from "@solar-icons/react/outline/question-circle";
import { RefreshIcon } from "@solar-icons/react/outline/refresh";
import { RoundDoubleAltArrowRightIcon } from "@solar-icons/react/outline/round-double-alt-arrow-right";
import { SidebarMinimalisticIcon } from "@solar-icons/react/outline/sidebar-minimalistic";
import { StarsIcon } from "@solar-icons/react/outline/stars";
import { TextFieldIcon } from "@solar-icons/react/outline/text-field";
import { ToolboxIcon } from "@solar-icons/react/outline/toolbox";
import { Tuning2Icon } from "@solar-icons/react/outline/tuning-2";
import { UserRoundedIcon } from "@solar-icons/react/outline/user-rounded";
import { UsersGroupRoundedIcon } from "@solar-icons/react/outline/users-group-rounded";
import { Widget4Icon } from "@solar-icons/react/outline/widget-4";
import { WidgetIcon } from "@solar-icons/react/outline/widget";
import { WindowFrameIcon } from "@solar-icons/react/outline/window-frame";

const NAV_ICONS: Record<string, ComponentType<{ size?: number }>> = {
  "alert-24": BellIcon,
  "apps-24": Widget4Icon,
  "apps-list-24": ListIcon,
  "apps-list-detail-24": SidebarMinimalisticIcon,
  "arrow-sync-24": RefreshIcon,
  "board-24": WidgetIcon,
  "bookmark-24": BookmarkIcon,
  "bot-24": BotIcon,
  "calendar-24": CalendarIcon,
  "chat-24": ChatRoundIcon,
  "chat-bubbles-question-24": QuestionCircleIcon,
  "chat-more-24": ChatRoundDotsIcon,
  "checkbox-24": CheckSquareIcon,
  "clock-24": ClockCircleIcon,
  "code-24": CodeIcon,
  "code-block-24": CodeSquareIcon,
  "comment-24": DialogIcon,
  "content-view-24": WindowFrameIcon,
  "data-bar-vertical-ascending-24": ChartIcon,
  "document-text-24": DocumentTextIcon,
  "drafts-24": NotesIcon,
  "fast-forward-circle-24": RoundDoubleAltArrowRightIcon,
  "form-24": ClipboardTextIcon,
  "gallery-24": GalleryIcon,
  "image-off-24": GalleryRemoveIcon,
  "layers-24": LayersIcon,
  "library-24": LibraryIcon,
  "lightbulb-filament-24": LightbulbIcon,
  "list-bar-24": HamburgerMenuIcon,
  "magic-wand-3-24": MagicWand3Icon,
  "number-symbol-square-24": HashtagSquareIcon,
  "options-24": Tuning2Icon,
  "paint-brush-24": PaintBrushIcon,
  "palette-24": PaletteIcon,
  "people-community-24": UsersGroupRoundedIcon,
  "person-24": UserRoundedIcon,
  "play-circle-24": PlayCircleIcon,
  "sparkle-24": StarsIcon,
  "table-24": ClipboardListIcon,
  "text-edit-style-24": TextFieldIcon,
  "wrench-screwdriver-24": ToolboxIcon,
};

export function NavIcon({ name }: { name: string }) {
  const Icon = NAV_ICONS[name];
  if (!Icon) return null;
  return <Icon size={16} />;
}
