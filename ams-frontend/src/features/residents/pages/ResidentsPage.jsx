import { useEffect, useState } from 'react';
import { Edit3, Plus, RefreshCcw, Trash2, X } from 'lucide-react';
import { fetchApartments } from '../../apartments/api/apartmentsApi';
import {
  createResident,
  deleteResident,
  fetchResidents,
  updateResident,
} from '../api/residentsApi';

const emptyForm = {
  fullName: '',
  identityNumber: '',
  phone: '',
  dateOfBirth: '',
  relationToOwner: '',
  apartmentId: '',
  status: 'ACTIVE',
};

function getApartmentLabel(resident) {
  return (
    resident.apartmentCode ||
    resident.apartment?.code ||
    resident.household?.apartment?.code ||
    resident.apartmentId ||
    '-'
  );
}

function ResidentsPage() {
  const [residents, setResidents] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function loadPageData() {
    setIsLoading(true);
    setError('');

    const [residentsResult, apartmentsResult] = await Promise.allSettled([
      fetchResidents(),
      fetchApartments(),
    ]);

    if (residentsResult.status === 'fulfilled') {
      setResidents(residentsResult.value);
    } else {
      setResidents([]);
      setError(residentsResult.reason?.message || 'Khong tai duoc danh sach cu dan.');
    }

    if (apartmentsResult.status === 'fulfilled') {
      setApartments(apartmentsResult.value);
    }

    setIsLoading(false);
  }

  useEffect(() => {
    loadPageData();
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(resident) {
    setEditingId(resident.id);
    setForm({
      fullName: resident.fullName ?? '',
      identityNumber: resident.identityNumber ?? '',
      phone: resident.phone ?? '',
      dateOfBirth: resident.dateOfBirth ?? '',
      relationToOwner: resident.relationToOwner ?? '',
      apartmentId: resident.apartmentId ?? resident.apartment?.id ?? '',
      status: resident.status ?? 'ACTIVE',
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    const payload = {
      ...form,
      apartmentId: form.apartmentId === '' ? null : Number(form.apartmentId),
    };

    try {
      if (editingId) {
        await updateResident(editingId, payload);
      } else {
        await createResident(payload);
      }

      resetForm();
      await loadPageData();
    } catch (apiError) {
      setError(apiError.message || 'Khong luu duoc cu dan.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(resident) {
    const confirmed = window.confirm(`Xoa hoac vo hieu hoa cu dan ${resident.fullName}?`);
    if (!confirmed) {
      return;
    }

    setError('');

    try {
      await deleteResident(resident.id);
      await loadPageData();
    } catch (apiError) {
      setError(apiError.message || 'Khong xoa duoc cu dan.');
    }
  }

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Resident</p>
          <h1>Quan ly cu dan</h1>
        </div>
        <button className="secondary-button" onClick={loadPageData} type="button">
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
              <h2>{editingId ? 'Cap nhat cu dan' : 'Them cu dan'}</h2>
            </div>
            {editingId ? (
              <button className="icon-button" onClick={resetForm} title="Huy sua" type="button">
                <X size={17} aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <label>
            Ho ten
            <input name="fullName" onChange={updateField} required type="text" value={form.fullName} />
          </label>

          <label>
            So dinh danh
            <input name="identityNumber" onChange={updateField} type="text" value={form.identityNumber} />
          </label>

          <label>
            So dien thoai
            <input name="phone" onChange={updateField} type="tel" value={form.phone} />
          </label>

          <label>
            Ngay sinh
            <input name="dateOfBirth" onChange={updateField} type="date" value={form.dateOfBirth} />
          </label>

          <label>
            Quan he voi chu ho
            <input name="relationToOwner" onChange={updateField} type="text" value={form.relationToOwner} />
          </label>

          <label>
            Can ho
            <select name="apartmentId" onChange={updateField} value={form.apartmentId}>
              <option value="">Chua gan</option>
              {apartments.map((apartment) => (
                <option key={apartment.id || apartment.code} value={apartment.id}>
                  {apartment.code}
                </option>
              ))}
            </select>
          </label>

          <label>
            Trang thai
            <select name="status" onChange={updateField} value={form.status}>
              <option value="ACTIVE">Dang cu tru</option>
              <option value="INACTIVE">Ngung cu tru</option>
            </select>
          </label>

          <button className="primary-button" disabled={isSubmitting} type="submit">
            <Plus size={17} aria-hidden="true" />
            {isSubmitting ? 'Dang luu...' : editingId ? 'Luu thay doi' : 'Them cu dan'}
          </button>
        </form>

        <section className="workspace-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Danh sach</p>
              <h2>Cu dan</h2>
            </div>
            <span className="count-badge">{residents.length}</span>
          </div>

          {isLoading ? <p className="muted-text">Dang tai danh sach...</p> : null}

          {!isLoading && residents.length === 0 ? (
            <p className="muted-text">Chua co du lieu cu dan.</p>
          ) : null}

          <div className="table-wrap">
            {residents.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Ho ten</th>
                    <th>Dinh danh</th>
                    <th>Dien thoai</th>
                    <th>Can ho</th>
                    <th>Trang thai</th>
                    <th aria-label="Thao tac" />
                  </tr>
                </thead>
                <tbody>
                  {residents.map((resident) => (
                    <tr key={resident.id || resident.identityNumber || resident.fullName}>
                      <td>{resident.fullName || '-'}</td>
                      <td>{resident.identityNumber || '-'}</td>
                      <td>{resident.phone || '-'}</td>
                      <td>{getApartmentLabel(resident)}</td>
                      <td>{resident.status || '-'}</td>
                      <td>
                        <div className="row-actions">
                          <button className="icon-button" onClick={() => startEdit(resident)} title="Sua" type="button">
                            <Edit3 size={16} aria-hidden="true" />
                          </button>
                          <button className="icon-button danger" onClick={() => handleDelete(resident)} title="Xoa" type="button">
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

export default ResidentsPage;
