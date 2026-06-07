package com.bluemoon.ams.module.dashboard.dto;

import java.math.BigDecimal;

/**
 * DTO thống kê tổng quan cho Dashboard.
 * Trả về 4 chỉ số chính: tổng căn hộ, tổng cư dân, tổng khoản thu, tổng thanh toán
 * cùng doanh thu tháng hiện tại và tỷ lệ thanh toán.
 */
public class DashboardStatsResponse {

    /** Tổng số căn hộ trong hệ thống. */
    private long totalApartments;

    /** Tổng số cư dân trong hệ thống. */
    private long totalResidents;

    /** Tổng số khoản thu trong hệ thống. */
    private long totalFees;

    /** Tổng số lần thanh toán đã ghi nhận. */
    private long totalPayments;

    /** Tổng doanh thu tháng hiện tại (tổng amount từ bảng payments trong tháng). */
    private BigDecimal monthlyRevenue;

    /** Tỷ lệ thanh toán: % khoản thu đã PAID / tổng khoản thu (0.0 – 100.0). */
    private double paymentRate;

    public DashboardStatsResponse() {
    }

    public DashboardStatsResponse(long totalApartments, long totalResidents,
                                   long totalFees, long totalPayments,
                                   BigDecimal monthlyRevenue, double paymentRate) {
        this.totalApartments = totalApartments;
        this.totalResidents = totalResidents;
        this.totalFees = totalFees;
        this.totalPayments = totalPayments;
        this.monthlyRevenue = monthlyRevenue;
        this.paymentRate = paymentRate;
    }

    // --- Getters & Setters ---

    public long getTotalApartments() {
        return totalApartments;
    }

    public void setTotalApartments(long totalApartments) {
        this.totalApartments = totalApartments;
    }

    public long getTotalResidents() {
        return totalResidents;
    }

    public void setTotalResidents(long totalResidents) {
        this.totalResidents = totalResidents;
    }

    public long getTotalFees() {
        return totalFees;
    }

    public void setTotalFees(long totalFees) {
        this.totalFees = totalFees;
    }

    public long getTotalPayments() {
        return totalPayments;
    }

    public void setTotalPayments(long totalPayments) {
        this.totalPayments = totalPayments;
    }

    public BigDecimal getMonthlyRevenue() {
        return monthlyRevenue;
    }

    public void setMonthlyRevenue(BigDecimal monthlyRevenue) {
        this.monthlyRevenue = monthlyRevenue;
    }

    public double getPaymentRate() {
        return paymentRate;
    }

    public void setPaymentRate(double paymentRate) {
        this.paymentRate = paymentRate;
    }
}
