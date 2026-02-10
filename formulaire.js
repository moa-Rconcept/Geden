(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const successBox = document.getElementById('formSuccess');
  const submitButton = form.querySelector('button[type="submit"]');
  const defaultBtnLabel = submitButton ? submitButton.textContent : 'Envoyer';
  const maxFileSizeBytes = 10 * 1024 * 1024;

  const fields = {
    lastname: form.querySelector('#lastname'),
    firstname: form.querySelector('#firstname'),
    email: form.querySelector('#email'),
    phone: form.querySelector('#phone'),
    subject: form.querySelector('#subject'),
    message: form.querySelector('#message'),
    file: form.querySelector('#file'),
    rgpd: form.querySelector('input[name="rgpd"]'),
    honeypot: form.querySelector('input[name="company"]')
  };

  function ensureGlobalErrorNode() {
    let node = form.querySelector('.form-error-global');
    if (!node) {
      node = document.createElement('div');
      node.className = 'form-error-global';
      node.hidden = true;
      node.setAttribute('aria-live', 'polite');
      form.appendChild(node);
    }
    return node;
  }

  function setGlobalError(message) {
    const node = ensureGlobalErrorNode();
    node.textContent = message;
    node.hidden = false;
  }

  function clearGlobalError() {
    const node = form.querySelector('.form-error-global');
    if (!node) return;
    node.hidden = true;
    node.textContent = '';
  }

  function getErrorNode(field) {
    const wrapper = field.closest('.form-field') || field.closest('label') || field.parentElement;
    if (!wrapper) return null;

    let error = wrapper.querySelector('.form-error');
    if (!error) {
      error = document.createElement('p');
      error.className = 'form-error';
      error.hidden = true;
      wrapper.appendChild(error);
    }
    return error;
  }

  function setFieldError(field, message) {
    field.classList.add('is-invalid');
    field.setAttribute('aria-invalid', 'true');
    const errorNode = getErrorNode(field);
    if (errorNode) {
      errorNode.textContent = message;
      errorNode.hidden = false;
    }
  }

  function clearFieldError(field) {
    field.classList.remove('is-invalid');
    field.removeAttribute('aria-invalid');
    const errorNode = getErrorNode(field);
    if (!errorNode) return;
    errorNode.hidden = true;
    errorNode.textContent = '';
  }

  function clearAllFieldErrors() {
    Object.values(fields).forEach((field) => {
      if (field) clearFieldError(field);
    });
  }

  function sanitizeValue(value) {
    return String(value || '').trim();
  }

  function validate() {
    const errors = [];

    const lastname = sanitizeValue(fields.lastname.value);
    if (!lastname) errors.push({ field: fields.lastname, message: 'Le nom est obligatoire.' });

    const email = sanitizeValue(fields.email.value);
    if (!email) {
      errors.push({ field: fields.email, message: 'L’email est obligatoire.' });
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailPattern.test(email)) {
        errors.push({ field: fields.email, message: 'Merci de saisir un email valide.' });
      }
    }

    const subject = sanitizeValue(fields.subject.value);
    if (!subject) errors.push({ field: fields.subject, message: 'Merci de choisir un objet.' });

    const message = sanitizeValue(fields.message.value);
    if (!message) errors.push({ field: fields.message, message: 'Le message est obligatoire.' });

    const phone = sanitizeValue(fields.phone.value);
    if (phone) {
      const phonePattern = /^[+0-9().\s-]{6,25}$/;
      if (!phonePattern.test(phone)) {
        errors.push({ field: fields.phone, message: 'Merci de saisir un numéro de téléphone valide.' });
      }
    }

    if (!fields.rgpd.checked) {
      errors.push({ field: fields.rgpd, message: 'Votre consentement est requis pour envoyer le formulaire.' });
    }

    const attachment = fields.file.files && fields.file.files[0];
    if (attachment && attachment.size > maxFileSizeBytes) {
      errors.push({ field: fields.file, message: 'Le fichier dépasse 10 Mo.' });
    }

    return errors;
  }

  function buildMailtoUrl(data) {
    const recipient = form.dataset.recipient || 'contact@geden.fr';
    const name = [data.firstname, data.lastname].filter(Boolean).join(' ');
    const mailSubject = `[Site GeDEN] ${data.subject || 'Demande de contact'}`;
    const body = [
      '--- Message envoyé depuis le site GeDEN ---',
      `Nom : ${name || data.lastname}`,
      `Email : ${data.email}`,
      `Téléphone : ${data.phone || 'Non renseigné'}`,
      '',
      'Message :',
      data.message
    ].join('\n');

    return `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(body)}`;
  }

  function buildEmailPayload(data) {
    return {
      recipient: form.dataset.recipient || 'contact@geden.fr',
      logoUrl: form.dataset.logoUrl || '',
      source: 'contact-page',
      sentAt: new Date().toISOString(),
      contact: {
        lastname: data.lastname,
        firstname: data.firstname,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message
      }
    };
  }

  async function submitToEndpoint(endpoint, data, file) {
    const hasFile = Boolean(file);
    const payload = buildEmailPayload(data);

    const requestOptions = {
      method: 'POST',
      headers: {
        Accept: 'application/json'
      }
    };

    if (hasFile) {
      const formData = new FormData();
      formData.append('payload', JSON.stringify(payload));
      formData.append('file', file);
      requestOptions.body = formData;
    } else {
      requestOptions.headers['Content-Type'] = 'application/json';
      requestOptions.body = JSON.stringify(payload);
    }

    const response = await fetch(endpoint, requestOptions);

    if (!response.ok) {
      throw new Error('Erreur de soumission');
    }
  }

  async function onSubmit(event) {
    event.preventDefault();
    clearGlobalError();
    clearAllFieldErrors();
    if (successBox) successBox.hidden = true;

    if (fields.honeypot && sanitizeValue(fields.honeypot.value)) {
      return;
    }

    const errors = validate();
    if (errors.length) {
      errors.forEach(({ field, message }) => setFieldError(field, message));
      const firstInvalid = errors[0] && errors[0].field;
      if (firstInvalid) firstInvalid.focus();
      setGlobalError('Le formulaire contient des erreurs. Merci de corriger les champs signalés.');
      return;
    }

    const data = {
      lastname: sanitizeValue(fields.lastname.value),
      firstname: sanitizeValue(fields.firstname.value),
      email: sanitizeValue(fields.email.value),
      phone: sanitizeValue(fields.phone.value),
      subject: sanitizeValue(fields.subject.value),
      message: sanitizeValue(fields.message.value)
    };

    const file = fields.file.files && fields.file.files[0] ? fields.file.files[0] : null;

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Envoi en cours…';
    }

    const endpoint = sanitizeValue(form.dataset.endpoint || form.getAttribute('action'));

    try {
      if (endpoint) {
        await submitToEndpoint(endpoint, data, file);
        if (successBox) {
          successBox.textContent = 'Merci, votre message a bien été envoyé. Nous revenons vers vous rapidement.';
          successBox.hidden = false;
        }
        form.reset();
      } else {
        window.location.href = buildMailtoUrl(data);
        if (successBox) {
          successBox.textContent = 'Votre client email a été ouvert. Vérifiez le message puis envoyez-le.';
          successBox.hidden = false;
        }
      }
    } catch (error) {
      setGlobalError('Impossible d’envoyer le formulaire pour le moment. Vérifiez votre endpoint (data-endpoint) ou écrivez-nous à contact@geden.fr.');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = defaultBtnLabel;
      }
    }
  }

  ['input', 'change', 'blur'].forEach((eventName) => {
    form.addEventListener(eventName, (event) => {
      if (event.target && event.target.classList && event.target.classList.contains('is-invalid')) {
        clearFieldError(event.target);
      }
    }, true);
  });

  form.addEventListener('submit', onSubmit);
})();
