import { useEffect, useState } from 'react';
import { Edit3, Plus, RefreshCcw, Trash2, X } from 'lucide-react';
import {
  createApartment,
  deleteApartment,
  fetchApartments,
  updateApartment,
} from '../api/apartmentsApi';

const emptyForm = {
  code: '',
  floor: '',
  area: '',
  status: 'AVAILABLE',
};

function ApartmentsPage() {
  const [apartments, setApartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function loadApartments() {
    setIsLoading(true);
    setError('');

    try {
      setApartments(await fetchApartments());
    } catch (apiError) {
      setError(apiError.message || 'Khong tai duoc danh sach can ho.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadApartments();
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(apartment) {
    setEditingId(apartment.id);
    setForm({
      code: apartment.code ?? '',
      floor: apartment.floor ?? '',
      area: apartment.area ?? '',
      status: apartment.status ?? 'AVAILABLE',
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    const payload = {
      ...form,
      area: form.area === '' ? null : Number(form.area),
    };

    try {
      if (editingId) {
        await updateApartment(editingId, payload);
      } else {
        await createApartment(payload);
      }

      resetForm();
      await loadApartments();
    } catch (apiError) {
      setError(apiError.message || 'Khong luu duoc can ho.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(apartment) {
    const confirmed = window.confirm(`Xoa hoac vo hieu hoa can ho ${apartment.code}?`);
    if (!confirmed) {
      return;
    }

    setError('');

    try {
      await deleteApartment(apartment.id);
      await loadApartments();
    } catch (apiError) {
      setError(apiError.message || 'Khong xoa duoc can ho.');
    }
  }

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Apartment</p>
          <h1>Quan ly can ho</h1>
        </div>
        <button className="secondary-button" onClick={loadApartments} type="button">
          <RefreshCcw size={17} aria-hidden="true" />
          Tai lai
        </button>
      </header>

      {error ? <div className="alert error">{error}</div> : null}

      <section className="workspace-grid">
        <form className="workspace-panel form-grid" onSubmit={handleSubmit}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Form</p>
              <h2>{editingId ? 'Cap nhat can ho' : 'Them can ho'}</h2>
            </div>
            {editingId ? (
              <button className="icon-button" onClick={resetForm} title="Huy sua" type="button">
                <X size={17} aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <label>
            Ma can ho
            <input name="code" onChange={updateField} required type="text" value={form.code} />
          </label>

          <label>
            Tang
            <input name="floor" onChange={updateField} type="text" value={form.floor} />
          </label>

          <label>
            Dien tich
            <input min="0" name="area" onChange={updateField} step="0.01" type="number" value={form.area} />
          </label>

          <label>
            Trang thai
            <select name="status" onChange={updateField} value={form.status}>
              <option value="AVAILABLE">Con trong</option>
              <option value="OCCUPIED">Dang o</option>
              <option value="INACTIVE">Ngung su dung</option>
            </select>
          </label>

          <button className="primary-button" disabled={isSubmitting} type="submit">
            <Plus size={17} aria-hidden="true" />
            {isSubmitting ? 'Dang luu...' : editingId ? 'Luu thay doi' : 'Them can ho'}
          </button>
        </form>

        <section className="workspace-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Danh sach</p>
              <h2>Can ho</h2>
            </div>
            <span className="count-badge">{apartments.length}</span>
          </div>

          {isLoading ? <p className="muted-text">Dang tai danh sach...</p> : null}

          {!isLoading && apartments.length === 0 ? (
            <p className="muted-text">Chua co du lieu can ho.</p>
          ) : null}

          <div className="table-wrap">
            {apartments.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Ma can ho</th>
                    <th>Tang</th>
                    <th>Dien tich</th>
                    <th>Trang thai</th>
                    <th aria-label="Thao tac" />
                  </tr>
                </thead>
                <tbody>
                  {apartments.map((apartment) => (
                    <tr key={apartment.id || apartment.code}>
                      <td>{apartment.code || '-'}</td>
                      <td>{apartment.floor || '-'}</td>
                      <td>{apartment.area ?? '-'}</td>
                      <td>{apartment.status || '-'}</td>
                      <td>
                        <div className="row-actions">
                          <button className="icon-button" onClick={() => startEdit(apartment)} title="Sua" type="button">
                            <Edit3 size={16} aria-hidden="true" />
                          </button>
                          <button className="icon-button danger" onClick={() => handleDelete(apartment)} title="Xoa" type="button">
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </div>
        </section>
      </section>
    </>
  );
}

export default ApartmentsPage;
