import { useEffect, useState } from 'react';
import { AlertCircle, Car, RefreshCcw } from 'lucide-react';
import {
  createVehicle,
  deleteVehicle,
  fetchVehicles,
  fetchVehiclesByApartment,
  updateVehicle,
} from '../api/vehiclesApi';
import { fetchResidents } from '../../residents/api/residentsApi';
import { fetchApartments } from '../../apartments/api/apartmentsApi';
import { STANDARD_FEE, previewMonthlyFee, vehicleTypeLabel } from '../constants';
import { useToast } from '../../../components/ui/Toast';
import VehicleForm from '../components/VehicleForm';
import VehicleTable from '../components/VehicleTable';

const SERIF = { fontFamily: "'Playfair Display', Georgia, serif" };

const emptyForm = {
  licensePlate: '',
  brand: '',
  vehicleType: 'MOTORBIKE',
  color: '',
  residentId: '',
  apartmentId: '',
};

function VehiclesPage() {
  const [vehicles, setVehicles]         = useState([]);
  const [residents, setResidents]       = useState([]);
  const [apartments, setApartments]     = useState([]);
  const [form, setForm]                 = useState(emptyForm);
  const [editingId, setEditingId]       = useState(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');
  const [fee, setFee]                   = useState(null);
  const showToast = useToast();

  async function loadVehicles() {
    setIsLoading(true);
    setError('');
    try {
      setVehicles(await fetchVehicles());
    } catch (apiError) {
      setError(apiError.message || 'Không tải được danh sách xe.');
    } finally {
      setIsLoading(false);
    }
  }

  // Tải danh sách xe + dữ liệu cho dropdown (cư dân, căn hộ) khi vào trang.
  useEffect(() => {
    loadVehicles();
    fetchResidents()
      .then(setResidents)
      .catch((err) => console.error('Không tải được cư dân:', err));
    fetchApartments()
      .then(setApartments)
      .catch((err) => console.error('Không tải được căn hộ:', err));
  }, []);

  // Phí dự kiến: tạo mới → tính theo số xe hiện có của căn hộ; sửa → phí đã chốt.
  useEffect(() => {
    let ignore = false;

    if (editingId) {
      const editing = vehicles.find((v) => v.id === editingId);
      setFee({ amount: editing?.monthlyFee ?? null, loading: false, error: '', position: null });
      return undefined;
    }

    if (!form.apartmentId) {
      setFee(null);
      return undefined;
    }

    setFee({ amount: null, loading: true, error: '', position: null });
    fetchVehiclesByApartment(form.apartmentId)
      .then((list) => {
        if (ignore) return;
        const activeCount = list.length; // endpoint chỉ trả xe đang hoạt động
        setFee({
          amount: previewMonthlyFee(activeCount),
          loading: false,
          error: '',
          position: activeCount + 1,
        });
      })
      .catch(() => {
        if (ignore) return;
        setFee({
          amount: STANDARD_FEE,
          loading: false,
          error: 'Không tải được số xe hiện có — tạm hiển thị mức phí tiêu chuẩn.',
          position: null,
        });
      });

    return () => { ignore = true; };
  }, [form.apartmentId, editingId, vehicles]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(vehicle) {
    setEditingId(vehicle.id);
    setForm({
      licensePlate: vehicle.licensePlate ?? '',
      brand:        vehicle.brand ?? '',
      vehicleType:  vehicle.vehicleType ?? 'MOTORBIKE',
      color:        vehicle.color ?? '',
      residentId:   vehicle.residentId != null ? String(vehicle.residentId) : '',
      apartmentId:  vehicle.apartmentId != null ? String(vehicle.apartmentId) : '',
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    const payload = {
      licensePlate: form.licensePlate.trim(),
      brand:        form.brand.trim() || null,
      vehicleType:  form.vehicleType,
      color:        form.color.trim() || null,
      residentId:   form.residentId ? Number(form.residentId) : null,
      apartmentId:  form.apartmentId ? Number(form.apartmentId) : null,
    };
    try {
      if (editingId) {
        await updateVehicle(editingId, payload);
      } else {
        await createVehicle(payload);
      }
      resetForm();
      await loadVehicles();
      showToast(editingId ? 'Cập nhật xe thành công!' : 'Đăng ký xe thành công!', 'success');
    } catch (apiError) {
      setError(apiError.message || 'Không lưu được thông tin xe.');
      showToast(apiError.message || 'Không lưu được thông tin xe.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(vehicle) {
    const confirmed = window.confirm(`Ngừng sử dụng xe biển số ${vehicle.licensePlate}?`);
    if (!confirmed) return;
    setError('');
    try {
      await deleteVehicle(vehicle.id);
      if (editingId === vehicle.id) resetForm();
      await loadVehicles();
      showToast('Đã ngừng sử dụng xe!', 'success');
    } catch (apiError) {
      setError(apiError.message || 'Không thực hiện được thao tác.');
      showToast(apiError.message || 'Không thực hiện được thao tác.', 'error');
    }
  }

  const term = search.trim().toLowerCase();
  const filtered = term
    ? vehicles.filter((v) =>
        [
          v.licensePlate,
          v.brand,
          v.residentName,
          v.roomNumber,
          vehicleTypeLabel(v.vehicleType),
        ]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(term)),
      )
    : vehicles;

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">
            <Car size={12} strokeWidth={2.5} aria-hidden="true" />
            Phương tiện
          </p>
          <h1 style={{ ...SERIF, letterSpacing: '-0.025em' }}>Quản lý xe</h1>
        </div>

        <button
          className="pm-btn-circle"
          onClick={loadVehicles}
          type="button"
          title="Tải lại danh sách"
          aria-label="Tải lại"
          style={{ width: '44px', height: '44px' }}
        >
          <RefreshCcw size={17} strokeWidth={2} aria-hidden="true" />
        </button>
      </header>

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
          borderRadius: '12px', padding: '12px 18px', color: '#f87171',
          marginBottom: '20px', fontSize: '0.88rem', fontWeight: 600,
        }}>
          <AlertCircle size={15} strokeWidth={2} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{error}</span>
          <button
            onClick={loadVehicles}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              background: 'rgba(248,113,113,0.12)', border: 'none', borderRadius: '8px',
              padding: '5px 12px', color: '#f87171', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
            }}
          >
            <RefreshCcw size={12} strokeWidth={2.5} /> Thử lại
          </button>
        </div>
      )}

      <section className="workspace-grid">
        <VehicleForm
          form={form}
          editingId={editingId}
          residents={residents}
          apartments={apartments}
          isSubmitting={isSubmitting}
          fee={fee}
          onFieldChange={updateField}
          onSubmit={handleSubmit}
          onCancelEdit={resetForm}
        />

        <VehicleTable
          vehicles={filtered}
          isLoading={isLoading}
          editingId={editingId}
          search={search}
          onSearchChange={setSearch}
          onEdit={startEdit}
          onDelete={handleDelete}
        />
      </section>
    </>
  );
}

export default VehiclesPage;
