package com.bluemoon.ams.module.report.repository;

import com.bluemoon.ams.module.report.entity.ResidentReport;
import com.bluemoon.ams.module.report.entity.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResidentReportRepository extends JpaRepository<ResidentReport, Long> {

    List<ResidentReport> findAllByOrderByCreatedAtDesc();

    List<ResidentReport> findBySubmittedByIdOrderByCreatedAtDesc(Long userId);

    List<ResidentReport> findByStatusOrderByCreatedAtDesc(ReportStatus status);
}
