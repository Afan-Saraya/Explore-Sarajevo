import { useState, useRef, useEffect } from 'react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [color, setColor] = useState(parseRgba(value));
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  function parseRgba(rgba: string) {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
        a: match[4] ? parseFloat(match[4]) : 1,
      };
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  }

  function rgbaToString(c: typeof color) {
    return `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`;
  }

  function rgbaToHex(c: typeof color) {
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(c.r)}${toHex(c.g)}${toHex(c.b)}`;
  }

  function hexToRgba(hex: string, alpha: number) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: alpha,
      };
    }
    return color;
  }

  const handleColorChange = (newColor: typeof color) => {
    setColor(newColor);
    onChange(rgbaToString(newColor));
  };

  const handleHexChange = (hex: string) => {
    const newColor = hexToRgba(hex, color.a);
    handleColorChange(newColor);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative" ref={pickerRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-3 w-full px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <div
            className="w-10 h-10 rounded border border-gray-300 shadow-sm"
            style={{ backgroundColor: rgbaToString(color) }}
          />
          <span className="text-sm text-gray-700 font-mono">{rgbaToString(color)}</span>
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-2 p-4 bg-white rounded-lg shadow-xl border border-gray-200 w-64">
            <div className="space-y-4">
              {/* Hex Input */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Hex</label>
                <input
                  type="text"
                  value={rgbaToHex(color)}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="#ffffff"
                />
              </div>

              {/* RGB Sliders */}
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Red: {color.r}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={color.r}
                    onChange={(e) =>
                      handleColorChange({ ...color, r: parseInt(e.target.value) })
                    }
                    className="w-full h-2 bg-gradient-to-r from-black to-red-500 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Green: {color.g}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={color.g}
                    onChange={(e) =>
                      handleColorChange({ ...color, g: parseInt(e.target.value) })
                    }
                    className="w-full h-2 bg-gradient-to-r from-black to-green-500 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Blue: {color.b}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={color.b}
                    onChange={(e) =>
                      handleColorChange({ ...color, b: parseInt(e.target.value) })
                    }
                    className="w-full h-2 bg-gradient-to-r from-black to-blue-500 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Alpha: {color.a.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={color.a}
                    onChange={(e) =>
                      handleColorChange({ ...color, a: parseFloat(e.target.value) })
                    }
                    className="w-full h-2 bg-gradient-to-r from-transparent to-gray-900 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Preview</label>
                <div
                  className="w-full h-12 rounded border border-gray-300"
                  style={{ backgroundColor: rgbaToString(color) }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
