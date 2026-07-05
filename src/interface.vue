<script lang="ts">
import { defineComponent } from "vue";
import { onMounted, onUnmounted } from "vue";

const SAVE_BUTTON_CONTAINER_SELECTOR = "#app header .actions";
const SAVE_BUTTON_SELECTOR = `${SAVE_BUTTON_CONTAINER_SELECTOR} button:has([data-icon="check"])`;
const SAVE_BUTTON_FALLBACK_SELECTOR = "#app header button:has([data-icon='check'])";
const MENU_OUTLET_SELECTOR = "#menu-outlet";
const MENU_ITEM_SELECTOR = `${MENU_OUTLET_SELECTOR} ul.v-list > .v-list-item.link.clickable`;
const SAVE_AS_COPY_BUTTON_ID = "custom_save_as_copy_button";

const COPY_ICON_SELECTORS = [
  "i[data-icon='content_copy']",
  "i[data-icon='copy_all']",
  "i[data-icon='control_point_duplicate']",
  "i[data-icon='done_all']",
  "i[data-icon='library_add']",
];

function findSaveAsCopyMenuItem(): HTMLElement | null {
  const menuOutlet = document.querySelector(MENU_OUTLET_SELECTOR);
  if (!menuOutlet) return null;

  const textMatch = Array.from(menuOutlet.querySelectorAll(MENU_ITEM_SELECTOR)).find((item) =>
    item.textContent?.trim().toLowerCase().includes("save as copy")
  ) as HTMLElement | undefined;

  if (textMatch) return textMatch;

  for (const selector of COPY_ICON_SELECTORS) {
    const icon = menuOutlet.querySelector(selector);
    if (icon) {
      const menuItem = icon.closest(".v-list-item.link.clickable") as
        | HTMLElement
        | null;
      if (menuItem) return menuItem;
    }
  }

  return null;
}

function openActionMenu(): boolean {
  const candidates = [
    `${SAVE_BUTTON_CONTAINER_SELECTOR} .v-menu-activator .v-icon.has-click`,
    `${SAVE_BUTTON_CONTAINER_SELECTOR} .v-menu-activator [data-icon='more_vert']`,
    `${SAVE_BUTTON_CONTAINER_SELECTOR} .v-menu-activator [data-icon='dots_vertical']`,
    `${SAVE_BUTTON_CONTAINER_SELECTOR} .v-menu-activator [aria-label*='more' i]`,
  ];

  for (const selector of candidates) {
    const element = document.querySelector(selector) as HTMLElement | null;
    if (!element) continue;

    const clickable =
      (element.closest("button, .v-icon.has-click, .v-menu-activator") as HTMLElement | null) ||
      element;
    clickable.click();
    return true;
  }

  return false;
}

export default defineComponent({
  setup() {
    let newSaveAsCopyButton: HTMLButtonElement | null = null;
    let saveButton: HTMLButtonElement | null = null;
    let saveButtonObserver: MutationObserver | null = null;
    let saveAsCopyMenuObserver: MutationObserver | null = null;
    let saveButtonContainerObserver: MutationObserver | null = null;
    let saveAsCopyRequested = false;

    const triggerSaveAsCopy = () => {
      const menuItem = findSaveAsCopyMenuItem();
      if (!menuItem) return false;
      menuItem.click();
      return true;
    };

    const syncDisabledState = () => {
      if (!newSaveAsCopyButton || !saveButton) return;

      const disabled = saveButton.hasAttribute("disabled");
      if (disabled) {
        newSaveAsCopyButton.setAttribute("disabled", "disabled");
      } else {
        newSaveAsCopyButton.removeAttribute("disabled");
      }
      newSaveAsCopyButton.style.marginLeft = disabled ? "10px" : "0px";
    };

    const attachSaveButtonObserver = () => {
      if (!saveButton) return;

      if (saveButtonObserver) saveButtonObserver.disconnect();
      saveButtonObserver = new MutationObserver(() => {
        syncDisabledState();
      });

      saveButtonObserver.observe(saveButton, {
        attributes: true,
        attributeFilter: ["disabled"],
      });
    };

    const injectSaveAsCopyButton = () => {
      saveButton = (document.querySelector(SAVE_BUTTON_SELECTOR) ||
        document.querySelector(SAVE_BUTTON_FALLBACK_SELECTOR)) as HTMLButtonElement | null;
      if (!saveButton) return;

      newSaveAsCopyButton = document.querySelector(
        `#${SAVE_AS_COPY_BUTTON_ID}`
      ) as HTMLButtonElement | null;

      if (!newSaveAsCopyButton) {
        // Clone the native save button so size/shape/styles stay consistent.
        newSaveAsCopyButton = saveButton.cloneNode(true) as HTMLButtonElement;
        saveButton.parentNode?.appendChild(newSaveAsCopyButton);

        const icon = newSaveAsCopyButton.querySelector("i");
        if (icon) icon.setAttribute("data-icon", "content_copy");

        newSaveAsCopyButton.style.marginLeft = "10px";
        newSaveAsCopyButton.style.cursor = "pointer";
        newSaveAsCopyButton.id = SAVE_AS_COPY_BUTTON_ID;
        newSaveAsCopyButton.setAttribute("title", "Save as Copy");

        newSaveAsCopyButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();

          openActionMenu();
          saveAsCopyRequested = true;

          // Immediate attempt in case menu content is already mounted.
          if (triggerSaveAsCopy()) {
            saveAsCopyRequested = false;
          }
        });
      }

      attachSaveButtonObserver();
      syncDisabledState();
    };

    onMounted(() => {
      saveAsCopyMenuObserver = new MutationObserver(() => {
        if (!saveAsCopyRequested) return;

        if (triggerSaveAsCopy()) {
          saveAsCopyRequested = false;
        }
      });

      const menuOutlet = document.querySelector(MENU_OUTLET_SELECTOR);
      if (menuOutlet) {
        saveAsCopyMenuObserver.observe(menuOutlet, {
          childList: true,
          subtree: true,
        });
      }

      // Keep trying while editor header/actions mount or re-mount.
      saveButtonContainerObserver = new MutationObserver(() => {
        injectSaveAsCopyButton();
      });
      saveButtonContainerObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });

      injectSaveAsCopyButton();
    });

    onUnmounted(() => {
      if (saveButtonObserver) saveButtonObserver.disconnect();
      if (saveAsCopyMenuObserver) saveAsCopyMenuObserver.disconnect();
      if (saveButtonContainerObserver) saveButtonContainerObserver.disconnect();
    });

    return {};
  },
});
</script>
