import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDistance,
  isWithinRadius,
  calculateAttendanceStats,
  validateWorkReport,
  OFFICE_COORDINATES,
  AttendanceRecord,
} from './presence.ts';

test('calculateDistance returns 0 when coordinates are identical', () => {
  const dist = calculateDistance(OFFICE_COORDINATES, OFFICE_COORDINATES);
  assert.equal(dist, 0);
});

test('calculateDistance accurately measures nearby coordinates', () => {
  // Point roughly 110 meters north
  const nearby = {
    latitude: OFFICE_COORDINATES.latitude + 0.001,
    longitude: OFFICE_COORDINATES.longitude,
  };
  const dist = calculateDistance(OFFICE_COORDINATES, nearby);
  assert.ok(dist > 90 && dist < 130, `Expected ~111m, got ${dist}`);
});

test('isWithinRadius checks threshold accurately', () => {
  assert.equal(isWithinRadius(12, 50), true);
  assert.equal(isWithinRadius(50, 50), true);
  assert.equal(isWithinRadius(51, 50), false);
  assert.equal(isWithinRadius(120, 50), false);
});

test('calculateAttendanceStats calculates correct totals and attendance percentage', () => {
  const records: AttendanceRecord[] = [
    {
      id: '1',
      date: '2024-05-20',
      dayName: 'Senin',
      formattedDate: 'Senin, 20 Mei',
      status: 'HADIR',
      checkInTime: '08:02',
      checkOutTime: '17:05',
      locationName: 'Gedung Pusat SIGAP',
      distanceMeters: 12,
      verified: true,
    },
    {
      id: '2',
      date: '2024-05-17',
      dayName: 'Jumat',
      formattedDate: 'Jumat, 17 Mei',
      status: 'IZIN',
      note: 'Keperluan Keluarga',
      locationName: 'Luar Kantor',
      distanceMeters: 4500,
      verified: true,
    },
    {
      id: '3',
      date: '2024-05-16',
      dayName: 'Kamis',
      formattedDate: 'Kamis, 16 Mei',
      status: 'HADIR',
      checkInTime: '07:55',
      checkOutTime: '17:15',
      locationName: 'Gedung Pusat SIGAP',
      distanceMeters: 8,
      verified: true,
    },
    {
      id: '4',
      date: '2024-05-15',
      dayName: 'Rabu',
      formattedDate: 'Rabu, 15 Mei',
      status: 'SAKIT',
      note: 'Surat Dokter Terlampir',
      locationName: 'Rumah',
      distanceMeters: 6200,
      verified: true,
    },
  ];

  const stats = calculateAttendanceStats(records);
  assert.equal(stats.total, 4);
  assert.equal(stats.hadir, 2);
  assert.equal(stats.izin, 1);
  assert.equal(stats.sakit, 1);
  assert.equal(stats.attendanceRatePercentage, 50); // 2/4 = 50%
});

test('validateWorkReport detects empty fields', () => {
  const invalid = validateWorkReport({
    date: '',
    detail: 'abc',
    output: '',
  });
  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.date);
  assert.ok(invalid.errors.detail);
  assert.ok(invalid.errors.output);

  const valid = validateWorkReport({
    date: '2024-05-21',
    detail: 'Melakukan pendataan penerima bansos desa',
    output: 'Terselesaikan 45 KK terdata valid',
  });
  assert.equal(valid.isValid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});
