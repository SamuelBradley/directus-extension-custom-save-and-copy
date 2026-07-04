<script lang="ts">
import { defineComponent } from "vue";
import { onMounted, onUnmounted } from "vue";

const OBSERVABLE_SAVE_BUTTON_CONTAINER_SELECTOR =
  "#app header .actions .action-buttons";
const SAVE_BUTTON_SELECTOR = `${OBSERVABLE_SAVE_BUTTON_CONTAINER_SELECTOR} button:has([data-icon="check"])`;
const MENU_ACTIVATOR_SELECTOR = `div.v-menu > div.v-menu-activator > span.v-icon.has-click`;
const MENU_OUTLET_SELECTOR = "#menu-outlet";
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

  const textMatch = Array.from(
    menuOutlet.querySelectorAll("ul.v-list > li.v-list-item.link.clickable")
  ).find((item) =>
    item.textContent?.trim().toLowerCase().includes("save as copy")
  ) as HTMLElement | undefined;

  if (textMatch) return textMatch;

  for (const selector of COPY_ICON_SELECTORS) {
    const icon = menuOutlet.querySelector(selector);
    if (icon) {
      const menuItem = icon.closest("li.v-list-item.link.clickable") as
        | HTMLElement
        | null;
      if (menuItem) return menuItem;
    }
  }

  return null;
}

export default defineComponent({
  setup() {
    let newSaveAsCopyButton: HTMLButtonElement | null = null;
    let saveButtonObserver: MutationObserver | null = null;
    let saveAsCopyMenuObserver: MutationObserver | null = null;
    let saveAsCopyRequested = false;

    const triggerSaveAsCopy = () => {
      const menuItem = findSaveAsCopyMenuItem();
      if (!menuItem) return false;
      menuItem.click();
      return true;
    };

    const syncDisabledState = (saveButton: Element | null) => {
      if (!newSaveAsCopyButton || !saveButton) return;

      const disabled = (saveButton as HTMLButtonElement).hasAttribute("disabled");
      if (disabled) {
        newSaveAsCopyButton.setAttribute("disabled", "disabled");
      } else {
        newSaveAsCopyButton.removeAttribute("disabled");
      }
      newSaveAsCopyButton.style.marginLeft = disabled ? "10px" : "0px";
    };

    onMounted(() => {
      // if the dialog is open, do not add the button
      if (document.querySelector("#dialog-outlet *")) {
        return;
      }

      // check if the custom button already exists
      newSaveAsCopyButton = document.querySelector(
        `#${SAVE_AS_COPY_BUTTON_ID}`
      ) as HTMLButtonElement | null;
      if (newSaveAsCopyButton) {
        return;
      }

      const saveButton = document.querySelector(SAVE_BUTTON_SELECTOR);

      saveButtonObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "attributes") {
            syncDisabledState(saveButton);
          }
        });
      });

      saveAsCopyMenuObserver = new MutationObserver(() => {
        if (!saveAsCopyRequested) return;

        if (triggerSaveAsCopy()) {
          saveAsCopyRequested = false;
        }
      });

      // observe the menu outlet to find the hidden save as copy button
      const menuOutlet = document.querySelector(MENU_OUTLET_SELECTOR);
      if (menuOutlet) {
        saveAsCopyMenuObserver.observe(menuOutlet, {
          childList: true,
          subtree: true,
        });
      }

      if (!saveButton) {
        return;
      }

      // observe the original save button to enable/disable the save as copy button
      saveButtonObserver.observe(saveButton, {
        attributeFilter: ["disabled"],
      });

      if (!newSaveAsCopyButton) {
        // deep clone the save button
        newSaveAsCopyButton = saveButton.cloneNode(true) as HTMLButtonElement;

        // append after the original
        saveButton.parentNode?.appendChild(newSaveAsCopyButton);

        // customize the icon
        const icon = newSaveAsCopyButton.querySelector("i");
        if (icon) {
          icon.setAttribute("data-icon", "content_copy");
        }

        newSaveAsCopyButton.style.marginLeft = "10px";
        newSaveAsCopyButton.style.cursor = "pointer";
        newSaveAsCopyButton.id = SAVE_AS_COPY_BUTTON_ID;
        newSaveAsCopyButton.setAttribute("title", "Save as Copy");

        syncDisabledState(saveButton);

        newSaveAsCopyButton.addEventListener("click", () => {
          // find the menu activator where the hidden save as copy button is located
          const menuActivator = document.querySelector(MENU_ACTIVATOR_SELECTOR);

          if (menuActivator) {
            // open the menu
            menuActivator.click();
          }

          // set the flag to trigger save as copy function after menu opens
          saveAsCopyRequested = true;

          // optimistic immediate attempt in case menu item is already in DOM
          if (triggerSaveAsCopy()) {
            saveAsCopyRequested = false;
          }
        });
      }
    });

    onUnmounted(() => {
      if (saveButtonObserver) saveButtonObserver.disconnect();
      if (saveAsCopyMenuObserver) saveAsCopyMenuObserver.disconnect();
    });

    return {};
  },
});
</script>
