import { useId, type CSSProperties } from 'react';
import { Check, Palette } from 'lucide-react';
import { t } from '../i18n';
import { themeColors, type useThemePalette } from '../theme';
import './color-picker.css';

const colors = [{ id: 'roomio', name: 'watchparty default', seed: '#8F3B49' }, ...themeColors];
export function ColorPicker({ palette }: { palette: ReturnType<typeof useThemePalette> }) {
  const group = useId();
  const selected = colors.find(color => color.id === palette.colorId) || colors[0];
  return <div className="color-garden">
    <div className="color-garden__current" role="status"><Palette size={24} aria-hidden="true" />
      <span><small>{t('Your color, everywhere')}</small><strong>{t(selected.name)}</strong></span>
      <span className="color-garden__current-dot" style={{ '--seed-color': selected.seed } as CSSProperties} aria-hidden="true" />
    </div>
    <fieldset className="color-garden__options"><legend className="sr-only">{t('Color theme')}</legend>
      {colors.map(color => <label key={color.id} className="color-garden__choice" style={{ '--seed-color': color.seed } as CSSProperties}>
        <input type="radio" name={group} value={color.id} checked={color.id === palette.colorId} aria-label={t(color.name)} onChange={() => palette.selectColor(color.id)} />
        <span className="color-garden__face"><span className="color-garden__swatch" aria-hidden="true" /><span className="color-garden__name">{t(color.name)}</span>
          <span className="color-garden__check" aria-hidden="true">{color.id === palette.colorId && <Check size={18} />}</span></span>
      </label>)}
    </fieldset>
  </div>;
}
