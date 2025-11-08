'use client';

import { useState } from 'react';

type FieldType = 'string' | 'int' | 'enum';

interface Field {
  fieldName: string;
  fieldSlug: string;
  fieldType: FieldType;
  fieldOptions?: string[];
}

export function BlueprintForm() {
  const [name, setName] = useState('Heavy Machinery Blueprint');
  const [sections, setSections] = useState('bearing_clearance');
  const [fields, setFields] = useState<Field[]>([
    {
      fieldName: 'Serial Number',
      fieldSlug: 'serial_number',
      fieldType: 'string',
    },
    {
      fieldName: 'Model Year',
      fieldSlug: 'model_year',
      fieldType: 'int',
    },
    {
      fieldName: 'Machine Type',
      fieldSlug: 'machine_type',
      fieldType: 'enum',
      fieldOptions: ['Type A', 'Type B', 'Type C'],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string>('');
  const [error, setError] = useState<string>('');

  const addField = () => {
    setFields([
      ...fields,
      {
        fieldName: '',
        fieldSlug: '',
        fieldType: 'string',
      },
    ]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, key: keyof Field, value: string | string[]) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: value };
    setFields(newFields);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse('');
    setError('');

    try {
      const payload = {
        name,
        sections: sections
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        fields: fields.map((field) => {
          const baseField = {
            fieldName: field.fieldName,
            fieldSlug: field.fieldSlug,
            fieldType: field.fieldType,
          };

          if (field.fieldType === 'enum' && field.fieldOptions) {
            return {
              ...baseField,
              fieldOptions: field.fieldOptions.filter(Boolean),
            };
          }

          return baseField;
        }),
      };

      console.log('Sending payload:', JSON.stringify(payload, null, 2));

      const res = await fetch('http://localhost:3000/blueprints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(`HTTP ${res.status}: ${res.statusText}`);
        setResponse(JSON.stringify(data, null, 2));
      } else {
        setResponse(JSON.stringify(data, null, 2));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Create Blueprint</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Blueprint Name *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Heavy Machinery Blueprint"
            />
          </div>

          <div>
            <label
              htmlFor="sections"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Sections (comma-separated) *
            </label>
            <input
              id="sections"
              type="text"
              value={sections}
              onChange={(e) => setSections(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., bearing_clearance, engine_specs"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Fields *
              </label>
              <button
                type="button"
                onClick={addField}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                + Add Field
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 dark:border-gray-600 rounded-md space-y-3"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Field {index + 1}
                    </span>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeField(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Field Name
                      </label>
                      <input
                        type="text"
                        value={field.fieldName}
                        onChange={(e) => updateField(index, 'fieldName', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., Serial Number"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Field Slug
                      </label>
                      <input
                        type="text"
                        value={field.fieldSlug}
                        onChange={(e) => updateField(index, 'fieldSlug', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., serial_number"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Field Type
                      </label>
                      <select
                        value={field.fieldType}
                        onChange={(e) =>
                          updateField(index, 'fieldType', e.target.value as FieldType)
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
                      >
                        <option value="string">String</option>
                        <option value="int">Integer</option>
                        <option value="enum">Enum</option>
                      </select>
                    </div>

                    {field.fieldType === 'enum' && (
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Options (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={field.fieldOptions?.join(', ') || ''}
                          onChange={(e) =>
                            updateField(
                              index,
                              'fieldOptions',
                              e.target.value.split(',').map((s) => s.trim()),
                            )
                          }
                          required={field.fieldType === 'enum'}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
                          placeholder="e.g., Type A, Type B, Type C"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? 'Sending...' : 'Create Blueprint'}
          </button>
        </form>

        {error && (
          <div className="mt-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <h3 className="text-lg font-semibold mb-2 text-red-800 dark:text-red-400">Error:</h3>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {response && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Response:</h3>
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto text-sm text-gray-800 dark:text-gray-200">
              {response}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
