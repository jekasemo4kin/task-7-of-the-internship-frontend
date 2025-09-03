export const formatFormData = (formData, customFields) => {
  const dataToSend = {};
  customFields.forEach(field => {
    const value = formData[field.name];
    if (field.type === 'NUMBER') {
      if (value !== '') {
        dataToSend[field.name] = Number(value);
      }
    } else if (field.type === 'BOOLEAN') {
      dataToSend[field.name] = !!value;
    } else {
      if (value !== '') {
        dataToSend[field.name] = value;
      }
    }
  });
  return dataToSend;
};