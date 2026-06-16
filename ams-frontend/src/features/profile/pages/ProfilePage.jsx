import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock3,
  RefreshCcw,
  Save,
  Send,
  UserRound,
  XCircle,
} from 'lucide-react';

import { fetchApartments } from '../../apartments/api/apartmentsApi';
import { updateProfile } from '../../auth/api/authApi';
import {
  fetchMyApartmentRequest,
  requestApartmentJoin,
} from '../../residents/api/residentsApi';
import { useToast } from '../../../components/ui/Toast';
import { useAuth } from '../../../store/authStore';

const SERIF = { fontFamily: "var(--font-display)" };

const emptyRequest = {
  apartmentId: '',
  identityNumber: '',
  phoneNumber: '',
  dateOfBirth: '',
  gender: '',
  relationshipType: 'OTHER',
};

const statusMeta = {
  PENDING: {
    label: 'Đang chờ admin duyệt',
    cls: 'pending',
    icon: Clock3,
    tone: '#fbbf24',
  },
  APPROVED: {
    label: 'Đã được duyệt',
    cls: 'approved',
    icon: CheckCircle2,
    tone: '#34d399',
  },
  REJECTED: {
    label: 'Bị từ chối',
    cls: 'rejected',
    icon: XCircle,
    tone: '#f87171',
  },
};

function toDateInput(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

function requestToForm(request) {
  if (!request) return emptyRequest;
  return {
    apartmentId: request.apartmentId ? String(request.apartmentId) : '',
    identityNumber: request.identityNumber ?? '',
    phoneNumber: request.phoneNumber ?? '',
    dateOfBirth: toDateInput(request.dateOfBirth),
    gender: request.gender ?? '',
    relationshipType: request.relationshipType ?? 'OTHER',
  };
}

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const showToast = useToast();

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName ?? '',
    email: user?.email ?? '',
  });
  const [requestForm, setRequestForm] = useState(emptyRequest);
  const [apartments, setApartments] = useState([]);
  const [apartmentRequest, setApartmentRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [error, setError] = useState('');

  const availableApartments = useMemo(
    () => apartments.filter((apartment) => apartment.status !== 'INACTIVE'),
    [apartments],
  );

  async function loadData() {
    setIsLoading(true);
    setError('');

    const [apartmentsResult, requestResult] = await Promise.allSettled([
      fetchApartments(),
      fetchMyApartmentRequest(),
    ]);

    if (apartmentsResult.status === 'fulfilled') {
      setApartments(apartmentsResult.value);
    } else {
      setApartments([]);
      setError(apartmentsResult.reason?.message || 'Không tải được danh sách căn hộ.');
    }

    if (requestResult.status === 'fulfilled') {
      setApartmentRequest(requestResult.value);
      setRequestForm(requestToForm(requestResult.value));
    }

    setIsLoading(false);
  }

  useEffect(() => {
    setProfileForm({
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
    });
  }, [user?.fullName, user?.email]);

  useEffect(() => {
    loadData();
  }, []);

  function updateProfileField(event) {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
  }

  function updateRequestField(event) {
    const { name, value } = event.target;
    setRequestForm((current) => ({ ...current, [name]: value }));
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setIsSavingProfile(true);
    setError('');

    try {
      const updated = await updateProfile(profileForm);
      updateUser(updated);
      showToast('Cập nhật hồ sơ thành công!', 'success');
    } catch (apiError) {
      const message = apiError.message || 'Không cập nhật được hồ sơ.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleRequestSubmit(event) {
    event.preventDefault();
    setIsSendingRequest(true);
    setError('');

    try {
      const payload = {
        ...requestForm,
        apartmentId: Number(requestForm.apartmentId),
        dateOfBirth: requestForm.dateOfBirth || null,
      };
      const created = await requestApartmentJoin(payload);
      setApartmentRequest(created);
      setRequestForm(requestToForm(created));
      showToast('Đã gửi yêu cầu căn hộ, vui lòng chờ admin duyệt.', 'success');
    } catch (apiError) {
      const message = apiError.message || 'Không gửi được yêu cầu căn hộ.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setIsSendingRequest(false);
    }
  }

  const approvalStatus = apartmentRequest?.approvalStatus;
  const status = statusMeta[approvalStatus] || null;
  const StatusIcon = status?.icon;

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">
            <UserRound size={12} strokeWidth={2.5} aria-hidden="true" />
            Tài khoản cư dân
          </p>
          <h1 style={{ ...SERIF, letterSpacing: '-0.025em' }}>Hồ sơ cá nhân</h1>
        </div>

        <button
          className="pm-btn-circle"
          onClick={loadData}
          type="button"
          title="Tải lại hồ sơ"
          aria-label="Tải lại"
          style={{ width: '44px', height: '44px' }}
        >
          <RefreshCcw size={17} strokeWidth={2} aria-hidden="true" />
        </button>
      </header>

      {error ? (
        <div className="alert error" style={{ marginBottom: 18 }}>
          <AlertCircle size={16} />
          {error}
        </div>
      ) : null}

      <section className="workspace-grid">
        <form className="workspace-panel form-grid" onSubmit={handleProfileSubmit}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow" style={{ marginBottom: 4 }}>Thông tin</p>
              <h2 style={SERIF}>Hồ sơ đăng nhập</h2>
            </div>
          </div>

          <label>
            Tên đăng nhập
            <input value={user?.username ?? ''} disabled readOnly />
          </label>

          <label>
            Họ và tên
            <input
              name="fullName"
              onChange={updateProfileField}
              required
              value={profileForm.fullName}
              placeholder="VD: Nguyễn Văn A"
            />
          </label>

          <label>
            Email
            <input
              name="email"
              onChange={updateProfileField}
              required
              type="email"
              value={profileForm.email}
              placeholder="email@example.com"
            />
          </label>

          <button className="primary-button" disabled={isSavingProfile} type="submit">
            <Save size={17} aria-hidden="true" />
            {isSavingProfile ? 'Đang lưu...' : 'Lưu hồ sơ'}
          </button>
        </form>

        <section className="workspace-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow" style={{ marginBottom: 4 }}>Căn hộ</p>
              <h2 style={SERIF}>Yêu cầu vào căn hộ</h2>
            </div>
            {status ? (
              <span className={`status-badge ${status.cls}`}>
                {StatusIcon ? <StatusIcon size={12} strokeWidth={2.5} /> : null}
                {status.label}
              </span>
            ) : null}
          </div>

          <div
            style={{
              display: 'grid',
              gap: 10,
              marginBottom: 18,
              padding: '14px 16px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, color: 'var(--text-secondary)' }}>
              <Building2 size={16} color="var(--accent)" />
              <span>
                Căn hộ hiện tại:{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {user?.apartmentCode || apartmentRequest?.roomNumber || 'Chưa được gán'}
                </strong>
              </span>
            </div>

            {apartmentRequest?.rejectReason ? (
              <p style={{ margin: 0, color: 'var(--danger)', fontSize: '0.86rem' }}>
                Lý do từ chối: {apartmentRequest.rejectReason}
              </p>
            ) : null}
          </div>

          <form className="form-grid" onSubmit={handleRequestSubmit}>
            <label>
              Chọn căn hộ muốn đăng ký
              <select
                name="apartmentId"
                onChange={updateRequestField}
                required
                value={requestForm.apartmentId}
              >
                <option value="">-- Chọn căn hộ --</option>
                {availableApartments.map((apartment) => (
                  <option key={apartment.id} value={apartment.id}>
                    {apartment.roomNumber} - Tầng {apartment.floor ?? '-'}
                    {apartment.status === 'OCCUPIED' ? ' (đang có cư dân)' : ''}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Số định danh (CCCD)
              <input
                name="identityNumber"
                onChange={updateRequestField}
                value={requestForm.identityNumber}
                placeholder="VD: 0123456789"
              />
            </label>

            <label>
              Số điện thoại
              <input
                name="phoneNumber"
                onChange={updateRequestField}
                type="tel"
                value={requestForm.phoneNumber}
                placeholder="VD: 0909 123 456"
              />
            </label>

            <label>
              Ngày sinh
              <input
                name="dateOfBirth"
                onChange={updateRequestField}
                type="date"
                value={requestForm.dateOfBirth}
              />
            </label>

            <label>
              Giới tính
              <select name="gender" onChange={updateRequestField} value={requestForm.gender}>
                <option value="">-- Chưa chọn --</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </label>

            <label>
              Quan hệ với chủ hộ
              <select
                name="relationshipType"
                onChange={updateRequestField}
                value={requestForm.relationshipType}
              >
                <option value="OWNER">Chủ hộ</option>
                <option value="SPOUSE">Vợ/Chồng</option>
                <option value="CHILD">Con</option>
                <option value="PARENT">Cha/Mẹ</option>
                <option value="SIBLING">Anh/Chị/Em</option>
                <option value="OTHER">Khác</option>
              </select>
            </label>

            <button
              className="primary-button"
              disabled={isLoading || isSendingRequest}
              type="submit"
            >
              <Send size={17} aria-hidden="true" />
              {isSendingRequest ? 'Đang gửi...' : approvalStatus === 'PENDING' ? 'Cập nhật yêu cầu' : 'Gửi yêu cầu duyệt'}
            </button>
          </form>
        </section>
      </section>
    </>
  );
}

export default ProfilePage;
