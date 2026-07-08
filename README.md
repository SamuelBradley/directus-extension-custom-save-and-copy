# Custom Save as Copy Button for Directus

This interface adds a custom save as copy button avoiding the need to menu dive.

It's a simple (and still hacky) workaround that doesn't rely on keyboard shortcuts.

Just add this custom field to your collection and you're good to go.

Use an underscore-safe field key such as `custom_save_as_copy`.
Do not use Directus's dashed auto-generated key for this helper field, because
hyphens in the field key break GraphQL validation on item pages.

![Add the custom hidden field to your collection](https://raw.githubusercontent.com/CiaccoDavide/directus-extension-custom-save-and-stay/refs/heads/main/screenshots/0_add_hidden_field_to_collection.png)

This extension promotes the hidden "Save as Copy" action to a visible button next to save.

## Notes

- This is still a DOM-level workaround and relies on Directus header/menu markup.
- The menu item is matched by label text ("Save as Copy") with icon-based fallbacks.
- If Directus changes item editor header or menu structure, selectors may need to be updated.
