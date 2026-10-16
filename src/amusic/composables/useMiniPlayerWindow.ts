import { ref, shallowRef, watch } from "vue";
import { toast } from "vue-sonner";
import { $t } from "@/plugins/i18n";
import { store } from "@/plugins/store";
import {
  detectMiniHostEnv,
  type MiniHint,
  pickMiniHost,
} from "@/amusic/miniHost";
import { openVideoPip, prepareVideoPip } from "@/amusic/videoPip";

/** Chromium's document picture-in-picture; not yet in the DOM typings. */
interface DocumentPip {
  requestWindow(options: { width: number; height: number }): Promise<Window>;
  window: Window | null;
}

const PIP_SIZE = 320;
const POPUP_FEATURES = "popup,width=340,height=360";
const POPUP_NAME = "amusic-mini";
const HINT_KEY = "amusic.miniHint.";

/** Where AmusicMiniPlayerHost teleports the mini player while a document-pip window is open. */
const pipBody = shallowRef<HTMLElement | null>(null);
const isOpen = ref(false);
let popup: Window | null = null;

function popupUrl() {
  const player = store.activePlayerId
    ? `&player=${encodeURIComponent(store.activePlayerId)}`
    : "";
  return `${location.pathname}#/discover?frameless&amusicMini=1${player}`;
}

// the popup is another app instance; it follows the active room through its url
watch(
  () => store.activePlayerId,
  () => {
    if (popup && !popup.closed) popup.location.hash = popupUrl().split("#")[1];
  },
);
// spec: closing the main tab closes the mini player (document-pip does this itself)
window.addEventListener("pagehide", () => popup?.close());

function hintOnce(hint: MiniHint) {
  try {
    if (localStorage.getItem(HINT_KEY + hint)) return;
    localStorage.setItem(HINT_KEY + hint, "1");
  } catch {
    // storage blocked: hint every time rather than never
  }
  toast.info($t(`amusic_mini_hint_${hint}`));
}

function copyStyles(target: Document) {
  for (const node of document.querySelectorAll(
    'link[rel="stylesheet"], style',
  )) {
    target.head.append(node.cloneNode(true));
  }
  // theme classes and the inline custom properties MA keeps on <html>
  target.documentElement.className = document.documentElement.className;
  target.documentElement.style.cssText = document.documentElement.style.cssText;
  target.body.style.cssText = "margin:0;height:100vh;overflow:hidden";
}

async function openDocumentPip() {
  const dpip = (window as unknown as { documentPictureInPicture: DocumentPip })
    .documentPictureInPicture;
  const win = await dpip.requestWindow({ width: PIP_SIZE, height: PIP_SIZE });
  // ponytail: styles are copied once; a theme switch while open shows on reopen
  copyStyles(win.document);
  win.addEventListener("pagehide", () => {
    pipBody.value = null;
    isOpen.value = false;
  });
  pipBody.value = win.document.body;
  isOpen.value = true;
}

function openPopup(hint?: MiniHint) {
  popup = window.open(popupUrl(), POPUP_NAME, POPUP_FEATURES);
  if (!popup) {
    toast.error($t("amusic_mini_blocked"));
    return;
  }
  if (hint) hintOnce(hint);
}

/** The always-on-top mini player (spec: mini-player-window). One per app. */
export function useMiniPlayerWindow() {
  const choice = pickMiniHost(detectMiniHostEnv());

  async function open() {
    try {
      if (choice.host === "document-pip") {
        // reopening focuses the window that is already there
        if (pipBody.value) return;
        await openDocumentPip();
      } else if (choice.host === "video-pip") {
        await openVideoPip(() => (isOpen.value = false));
        isOpen.value = true;
      } else {
        openPopup(choice.hint);
      }
    } catch (error) {
      toast.error($t("amusic_mini_failed"), {
        description: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    host: choice.host,
    /** call early (on mount) so Safari can go picture-in-picture inside the click */
    prepare: () => {
      if (choice.host === "video-pip") prepareVideoPip();
    },
    open,
    isOpen,
    pipBody,
  };
}
