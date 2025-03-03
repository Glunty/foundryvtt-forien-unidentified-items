import { FORIEN_UNIDENTIFIED_ITEMS_MODULE_NAME, getGame } from '../settings';
import { i18n } from './../../init';

export default class DefaultIcons extends FormApplication {
  static get defaultOptions(): any {
    const options = mergeObject(super.defaultOptions, {
      id: 'fui-default-icons',
      template: `/modules/${FORIEN_UNIDENTIFIED_ITEMS_MODULE_NAME}/templates/settings-default-icons.html`,
      title: i18n(`${FORIEN_UNIDENTIFIED_ITEMS_MODULE_NAME}.Settings.defaultIcons.name`),
      submitOnClose: true,
      submitOnChange: false,
      closeOnSubmit: true,
    });

    if (getGame().system.id === 'wfrp4e') {
      options.classes.push('wfrp');
    }
    return options;
  }

  getData(options = {}): any {
    const data: any = super.getData();
    data.types = this.getItemTypes();
    data.typeSettings = this.getSettings();
    data.options = this.options;
    return data;
    // return {
    //   types: this.getItemTypes(),
    //   propertySettings: this.getSettings(),
    //   options: this.options
    // };
  }

  activateListeners(html): void {
    super.activateListeners(html);

    html.on('change', 'input', (event) => {
      const input = $(event.currentTarget);
      const type = input.attr('name');
      $(`#default-icon-img-${type}`).attr('src', String(input.val()));
    });

    html.on('click', '.file-picker', (event) => {
      Hooks.once('closeFilePicker', () => {
        const button = $(event.currentTarget);
        const target = button.data('target');
        $(`#fui-default-icons input[name=${target}]`).trigger('change');
      });
    });
  }

  async _updateObject(event, formData): Promise<any> {
    return await this.saveSettings(formData);
  }

  getSettings(): DefaultIcons {
    const settings = this.loadSettings();
    const types = this.getItemTypes();

    types.forEach((type) => {
      const setting: any = getProperty(settings, type);
      if (!setting) {
        settings[type] = this.getIcon(this.guessIcon(type));
      }
    });

    return settings;
  }

  guessIcon(type): string {
    const modes = ['inv-unidentified', 'unidentified'];
    const types = {
      armor: ['armor', 'armour', 'equipment', 'gear'],
      book: ['Skill', 'book', 'career', 'class', 'feat', 'skill', 'specialization', 'spellbook', 'talent'],
      emerald: ['ancestry', 'crystal', 'jewellery'],
      knapsack: ['backpack', 'container'],
      loot: ['loot', 'treasure'],
      potion: ['consumable'],
      sack: ['artifact', 'goods', 'trapping'],
      scroll: ['ability', 'enchantment', 'magic', 'prayer', 'sorcery', 'spell'],
      tool: ['tool'],
    };
    const mode = modes[Math.floor(Math.random() * modes.length)];
    let icon = mode;

    for (const iconType in types) {
      if (types[iconType].includes(type)) {
        icon = `${mode}-${iconType}`;
      }
    }

    return `${icon}.png`;
  }

  loadSettings(): DefaultIcons {
    return <DefaultIcons>getGame().settings.get(FORIEN_UNIDENTIFIED_ITEMS_MODULE_NAME, 'defaultIcons');
  }

  async saveSettings(data): Promise<DefaultIcons> {
    return <DefaultIcons>await getGame().settings.set(FORIEN_UNIDENTIFIED_ITEMS_MODULE_NAME, 'defaultIcons', data);
  }

  getItemTypes(): string[] {
    return Object.keys(getGame().system.model.Item);
  }

  getIcon(icon): string {
    return `/modules/${FORIEN_UNIDENTIFIED_ITEMS_MODULE_NAME}/icons/${icon}`;
  }
}
