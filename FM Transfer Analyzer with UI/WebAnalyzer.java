import java.util.*;
import java.time.LocalDate;
import java.io.File;

public class WebAnalyzer {
    private static final Scanner scanner = new Scanner(System.in);
    private static List<Transfer> transfers = new ArrayList<>();
    
    // ANSI color codes (simplified for now)
    public static final String ANSI_RESET = "\u001B[0m";
    public static final String ANSI_BLUE = "\u001B[34m";
    public static final String ANSI_GREEN = "\u001B[32m";
    public static final String ANSI_RED = "\u001B[31m";
    public static final String ANSI_CYAN = "\u001B[36m";
    public static final String ANSI_WHITE = "\u001B[37m";
    public static final String ANSI_BOLD = "\u001B[1m";
    
    public static void main(String[] args) {
        printBanner();
        loadSampleData();
        
        while (true) {
            try {
                displayMenu();
                int choice = scanner.nextInt();
                scanner.nextLine();
                
                switch (choice) {
                    case 1 -> addTransferData();
                    case 2 -> analyzeMarketTrends();
                    case 3 -> detectDiscrepancies();
                    case 4 -> generateValuationReport();
                    case 5 -> exportAnalysis();
                    case 6 -> {
                        System.out.println(ANSI_GREEN + "Exiting analyzer..." + ANSI_RESET);
                        return;
                    }
                    default -> System.out.println(ANSI_RED + "Invalid option. Please try again." + ANSI_RESET);
                }
            } catch (Exception e) {
                System.out.println(ANSI_RED + "❌ Error: " + e.getMessage() + ANSI_RESET);
                scanner.nextLine();
            }
        }
    }
    
    private static void printBanner() {
        System.out.println(ANSI_BLUE + ANSI_BOLD);
        System.out.println("╔══════════════════════════════════════════════════════════════════════════════╗");
        System.out.println("║                    ⚽ FM Transfer Analyzer Pro ⚽                          ║");
        System.out.println("║                Advanced Transfer Market Analysis                            ║");
        System.out.println("╚══════════════════════════════════════════════════════════════════════════════╝");
        System.out.println(ANSI_RESET);
        System.out.println(ANSI_CYAN + "Analyzing transfer market discrepancies and valuations" + ANSI_RESET + "\n");
    }
    
    private static void loadSampleData() {
        System.out.println(ANSI_BLUE + "Loading comprehensive transfer database..." + ANSI_RESET);
        
        // Copy the sample data from your backup
        transfers.add(new Transfer(new Player("Kylian Mbappe", 24, "ST", 180, 185, 2, 20), 
                     "PSG", "Real Madrid", 180_000_000, 1, "AI", LocalDate.now()));
        transfers.add(new Transfer(new Player("Erling Haaland", 23, "ST", 175, 185, 4, 19), 
                     "Borussia Dortmund", "Manchester City", 60_000_000, 1, "AI", LocalDate.now()));
        transfers.add(new Transfer(new Player("Jude Bellingham", 20, "CM", 165, 185, 4, 18), 
                     "Borussia Dortmund", "Real Madrid", 103_000_000, 1, "AI", LocalDate.now()));
        transfers.add(new Transfer(new Player("Moises Caicedo", 22, "DM", 160, 175, 3, 15), 
                     "Brighton", "Chelsea", 115_000_000, 1, "User", LocalDate.now()));
        transfers.add(new Transfer(new Player("Declan Rice", 24, "DM", 168, 175, 4, 16), 
                     "West Ham", "Arsenal", 105_000_000, 1, "User", LocalDate.now()));
        
        // Add more transfers from your backup...
        System.out.println(ANSI_GREEN + "✅ Loaded " + transfers.size() + " transfers" + ANSI_RESET);
    }
    
    private static void displayMenu() {
        System.out.println(ANSI_BLUE + "┌─────────────────────────────────────────────────────────────────┐" + ANSI_RESET);
        System.out.println(ANSI_BLUE + "│                          MAIN MENU                             │" + ANSI_RESET);
        System.out.println(ANSI_BLUE + "└─────────────────────────────────────────────────────────────────┘" + ANSI_RESET);
        System.out.println("1. ➕ Add Transfer Data");
        System.out.println("2. 📊 Analyze Market Trends");
        System.out.println("3. 🚨 Detect Discrepancies");
        System.out.println("4. 📋 Generate Valuation Report");
        System.out.println("5. 📄 Export Analysis");
        System.out.println("6. 🚪 Exit");
        System.out.print(ANSI_CYAN + "Choose option: " + ANSI_RESET);
    }
    
    private static void addTransferData() {
        System.out.println(ANSI_BLUE + "\n--- Add Transfer Data ---" + ANSI_RESET);
        System.out.print("Enter file path for transfer data: ");
        String filePath = scanner.nextLine();
        File file = new File(filePath);

        if (!file.exists() || !file.isFile()) {
            System.out.println(ANSI_RED + "❌ Invalid file path. Please try again." + ANSI_RESET);
            return;
        }

        try {
            List<Transfer> newTransfers = FMSaveFileParser.parseSaveFile(file);
            transfers.addAll(newTransfers);
            System.out.println(ANSI_GREEN + "✅ Successfully added " + newTransfers.size() + " transfers." + ANSI_RESET);
        } catch (Exception e) {
            System.out.println(ANSI_RED + "❌ Error parsing file: " + e.getMessage() + ANSI_RESET);
        }
    }
    
    private static void analyzeMarketTrends() {
        System.out.println(ANSI_BLUE + "\n--- Market Trends Analysis ---" + ANSI_RESET);
        
        double totalValue = transfers.stream()
            .mapToDouble(Transfer::getTransferFee)
            .sum();
        
        double averageAge = transfers.stream()
            .mapToInt(t -> t.getPlayer().getAge())
            .average()
            .orElse(0.0);
        
        System.out.printf(ANSI_WHITE + "Total Transfers: %d\n" + ANSI_RESET, transfers.size());
        System.out.printf(ANSI_WHITE + "Total Value: €%.2fM\n" + ANSI_RESET, totalValue / 1_000_000);
        System.out.printf(ANSI_WHITE + "Average Age: %.1f years\n" + ANSI_RESET, averageAge);
    }
    
    private static void detectDiscrepancies() {
        System.out.println(ANSI_BLUE + "\n--- Transfer Discrepancy Detection ---" + ANSI_RESET);
        for (Transfer transfer : transfers) {
            double fairValue = calculateFairValue(transfer.getPlayer());
            double discrepancy = (transfer.getTransferFee() - fairValue) / fairValue * 100;

            System.out.printf(ANSI_WHITE + "%s: Paid €%.2fM, Fair Value €%.2fM, Discrepancy: %.1f%% (%s)\n" + ANSI_RESET,
                transfer.getPlayer().getName(),
                transfer.getTransferFee() / 1_000_000,
                fairValue / 1_000_000,
                discrepancy,
                discrepancy > 0 ? "Overpaid" : "Underpaid");
        }
    }
    
    private static double calculateFairValue(Player player) {
        double baseValue = player.getCurrentAbility() * 1_000_000;
        if (player.getAge() <= 23) baseValue *= 1.3;
        if (player.getAge() >= 30) baseValue *= 0.8;
        return baseValue;
    }
    
    private static void generateValuationReport() {
        System.out.println(ANSI_BLUE + "\n--- Valuation Report ---" + ANSI_RESET);
        // Basic implementation
        for (Transfer transfer : transfers) {
            System.out.printf(ANSI_WHITE + "%s: €%.2fM (%s)\n" + ANSI_RESET, 
                transfer.getPlayer().getName(), 
                transfer.getTransferFee() / 1_000_000,
                transfer.getTransferType());
        }
    }
    
    private static void exportAnalysis() {
        System.out.println(ANSI_BLUE + "\n--- Export Analysis ---" + ANSI_RESET);
        System.out.println("Export feature coming soon...");
    }
    
    // Utility methods
    public void addTransfer(Transfer transfer) {
        transfers.add(transfer);
    }
    
    public List<Transfer> getAllTransfers() {
        return new ArrayList<>(transfers);
    }
}