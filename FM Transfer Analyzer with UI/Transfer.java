import java.time.LocalDate;

public class Transfer {
    private Player player;
    private String sellingClub;
    private String buyingClub;
    private double transferFee;
    private int leagueLevel;
    private String transferType;
    private LocalDate transferDate;
    
    // Default constructor
    public Transfer() {}
    
    // Constructor
    public Transfer(Player player, String sellingClub, String buyingClub, 
                   double transferFee, int leagueLevel, String transferType, LocalDate transferDate) {
        this.player = player;
        this.sellingClub = sellingClub;
        this.buyingClub = buyingClub;
        this.transferFee = transferFee;
        this.leagueLevel = leagueLevel;
        this.transferType = transferType;
        this.transferDate = transferDate;
    }
    
    // Getters and setters
    public Player getPlayer() { return player; }
    public void setPlayer(Player player) { this.player = player; }
    
    public String getSellingClub() { return sellingClub; }
    public void setSellingClub(String sellingClub) { this.sellingClub = sellingClub; }
    
    public String getBuyingClub() { return buyingClub; }
    public void setBuyingClub(String buyingClub) { this.buyingClub = buyingClub; }
    
    public double getTransferFee() { return transferFee; }
    public void setTransferFee(double transferFee) { this.transferFee = transferFee; }
    
    public int getLeagueLevel() { return leagueLevel; }
    public void setLeagueLevel(int leagueLevel) { this.leagueLevel = leagueLevel; }
    
    public String getTransferType() { return transferType; }
    public void setTransferType(String transferType) { this.transferType = transferType; }
    
    public LocalDate getTransferDate() { return transferDate; }
    public void setTransferDate(LocalDate transferDate) { this.transferDate = transferDate; }
    
    @Override
    public String toString() {
        return String.format("Transfer{player=%s, %s->%s, €%.2fM, %s}", 
                player.getName(), sellingClub, buyingClub, transferFee/1_000_000, transferType);
    }
}